import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import Payment from '@/models/Payment';
import Registration from '@/models/Registration';
import { requireAuth } from '@/lib/auth-helpers';

export async function GET() {
  const auth = await requireAuth();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  await connectDB();
  const today = new Date().toISOString().split('T')[0];

  const totalStudents = await Student.countDocuments();
  const totalPayments = await Payment.countDocuments();

  const todayDocs = await Payment.find({ date: today }).lean();
  const todayCount = todayDocs.length;

  const recentPaymentsRaw = await Payment.find().sort({ createdAt: -1 }).limit(5).lean();
  const recentPayments = recentPaymentsRaw.map(p => ({ ...p, _id: p._id.toString() }));

  const totalAgg = await Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
  const totalRevenue = totalAgg[0]?.total || 0;

  const todayAgg = await Payment.aggregate([
    { $match: { date: today } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const todayRevenue = todayAgg[0]?.total || 0;

  // --- Weekly Revenue Trend Logic (Last 6 Weeks) ---
  interface WeekData {
    week: string;
    startDate: Date;
    endDate: Date;
    revenue: number;
    count: number;
  }
  
  const last6Weeks: WeekData[] = [];
  const now = new Date();

  // Generate last 6 weeks ranges (Week 1 being the current week, going back 5 weeks)
  for (let i = 5; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(now.getDate() - (i * 7));
    const start = new Date(end);
    start.setDate(end.getDate() - 6);

    const label = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    
    last6Weeks.push({
      week: label,
      startDate: start,
      endDate: end,
      revenue: 0,
      count: 0
    });
  }

  const sixWeeksAgo = last6Weeks[0].startDate;

  const weeklyAgg = await Payment.aggregate([
    { $addFields: { dateObj: { $dateFromString: { dateString: '$date' } } } },
    { $match: { dateObj: { $gte: sixWeeksAgo } } },
    {
      $group: {
        _id: null,
        payments: { 
          $push: { 
            dateObj: '$dateObj', 
            amount: '$amount' 
          } 
        }
      }
    }
  ]).catch(() => []);

  if (weeklyAgg.length > 0 && weeklyAgg[0].payments) {
    weeklyAgg[0].payments.forEach((p: { dateObj: Date; amount: number }) => {
      const pDate = new Date(p.dateObj);
      const targetWeek = last6Weeks.find(w => pDate >= w.startDate && pDate <= w.endDate);
      if (targetWeek) {
        targetWeek.revenue += p.amount;
        targetWeek.count += 1;
      }
    });
  }

  const monthlyData = last6Weeks.map(w => ({
    month: w.week, // reusing the 'month' key so Recharts dataKey='month' works seamlessly
    revenue: w.revenue,
    count: w.count
  }));

  const modeAgg = await Registration.aggregate([
    { $match: { mode: { $nin: [null, "", undefined] } } }, 
    { $group: { _id: '$mode', count: { $sum: 1 }, total: { $sum: '$amount' } } },
    { $sort: { total: -1 } }
  ]).catch(() => []);

  const modeBreakdown = modeAgg.map(m => ({
    name: m._id,
    value: m.total,
    count: m.count
  }));

  const courseDistributionRaw = await Student.aggregate([
    {
      $lookup: {
        from: 'courses',
        localField: 'courseCode',
        foreignField: 'courseCode',
        as: 'courseDetails'
      }
    },
    {
      $addFields: {
        rawCourseName: { $ifNull: [{ $arrayElemAt: ['$courseDetails.title', 0] }, '$course', 'Unknown Course'] }
      }
    },
    {
      $addFields: {
        cleanName: { 
          $trim: { 
            input: '$rawCourseName' 
          } 
        }
      }
    },
    { $group: { _id: '$cleanName', count: { $sum: 1 } } }, 
    { $sort: { count: -1 } }, 
    { $limit: 10 }
  ]).catch(() => []);

  const courseDistribution = courseDistributionRaw.map(c => ({
    name: c._id && c._id.trim() !== '' ? c._id : 'Other Courses',
    value: c.count
  }));

  return NextResponse.json({
    totalStudents, 
    totalPayments,
    totalRevenue,
    todayRevenue,
    todayCount,
    recentPayments,
    monthlyData,
    modeBreakdown, 
    courseDistribution,
  });
}

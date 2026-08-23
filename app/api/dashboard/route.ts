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

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  interface MonthData {
    month: string;
    year: number;
    monthIdx: number;
    revenue: number;
    count: number;
  }
  const last6Months: MonthData[] = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({
      month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      year: d.getFullYear(),
      monthIdx: d.getMonth() + 1,
      revenue: 0, 
      count: 0
    });
  }

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const monthlyAgg = await Payment.aggregate([
    { $addFields: { dateObj: { $dateFromString: { dateString: '$date' } } } },
    { $match: { dateObj: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$dateObj' }, month: { $month: '$dateObj' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]).catch(() => []);

  monthlyAgg.forEach(agg => {
    const targetMonth = last6Months.find(m => m.year === agg._id.year && m.monthIdx === agg._id.month);
    if (targetMonth) {
      targetMonth.revenue = agg.total;
      targetMonth.count = agg.count;
    }
  });

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

  // 🔥 Fully fixed aggregation with $lookup and $trim to clean leading/trailing spaces
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
    monthlyData: last6Months, 
    modeBreakdown, 
    courseDistribution,
  });
}

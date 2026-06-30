import { FiDollarSign, FiCalendar, FiUsers, FiBox } from "react-icons/fi";

const stats = [
  { name: 'Total Revenue', value: '$45,231.89', change: '+20.1%', changeType: 'increase', icon: FiDollarSign, color: 'bg-green-100 text-green-600' },
  { name: 'Total Bookings', value: '356', change: '+12.5%', changeType: 'increase', icon: FiCalendar, color: 'bg-blue-100 text-blue-600' },
  { name: 'Available Rooms', value: '24 / 45', change: '53%', changeType: 'neutral', icon: FiBox, color: 'bg-purple-100 text-purple-600' },
  { name: 'Registered Users', value: '2,420', change: '+18.2%', changeType: 'increase', icon: FiUsers, color: 'bg-orange-100 text-orange-600' },
];

export default function OverviewDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, here's what's happening at Pink Lotus Residences today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-full flex justify-center items-center ${stat.color} flex-shrink-0`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className={`text-xs mt-1 font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-gray-500'}`}>
                {stat.change} from last month
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Recent Bookings (Mock) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 col-span-2 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { name: "John Doe", room: "Deluxe Hilltop", dates: "Oct 12 - Oct 15", status: "CONFIRMED" },
                  { name: "Jane Smith", room: "Small Suite", dates: "Oct 13 - Oct 14", status: "PENDING" },
                  { name: "Robert Johnson", room: "Apartment", dates: "Oct 10 - Oct 12", status: "COMPLETED" },
                  { name: "Emily Davis", room: "Single Room", dates: "Oct 18 - Oct 20", status: "CONFIRMED" },
                ].map((booking, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{booking.room}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{booking.dates}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">System Activity</h3>
          </div>
          <div className="p-6 flex-1">
            <ul className="space-y-5">
              {[
                { time: "10 mins ago", msg: "New booking received for Deluxe Room" },
                { time: "1 hour ago", msg: "Jane Smith registered as a new user" },
                { time: "3 hours ago", msg: "Payment confirmed for Booking #892" },
                { time: "5 hours ago", msg: "Admin logged into the system" },
                { time: "1 day ago", msg: "Room 'Apartment' details updated" },
              ].map((activity, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="relative flex-shrink-0 mt-1">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                    {idx !== 4 && <div className="absolute top-3 left-1 w-0.5 h-10 bg-gray-200"></div>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800">{activity.msg}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

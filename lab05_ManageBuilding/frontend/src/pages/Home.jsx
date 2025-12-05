import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, MapPin, Home, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

const featureCards = [
  { title: 'Thuê căn hộ nhanh', desc: 'Chọn căn for_rent, gửi yêu cầu và theo dõi trạng thái theo vai trò.', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
  { title: 'Mua căn hộ minh bạch', desc: 'Giá niêm yết rõ ràng, đề nghị mua tới chủ hộ/BQL.', icon: Home, color: 'text-emerald-600 bg-emerald-50' },
  { title: 'Bản đồ tương tác', desc: 'Duyệt block/tòa/tầng/căn hộ trực quan trên Interactive Map.', icon: MapPin, color: 'text-purple-600 bg-purple-50' },
];

const personas = [
  {
    title: 'Khách / User đã đăng ký',
    points: [
      'Xem Marketplace, bản đồ, tìm kiếm căn hộ.',
      'Gửi yêu cầu thuê/mua: guest nhập thông tin liên hệ; user đăng ký tự động điền sẵn.',
      'Theo dõi trạng thái yêu cầu (My Requests) sau khi đăng nhập.',
    ],
  },
  {
    title: 'Cư dân / Ban quản lý',
    points: [
      'Cư dân: xem căn hộ của tôi, yêu cầu của tôi.',
      'Chủ hộ: bật/tắt cho thuê/bán, đặt giá.',
      'Quản lý: duyệt yêu cầu, quản lý cư dân, người dùng.',
    ],
  },
];

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/40 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100 p-8 mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-emerald-50 pointer-events-none" />
          <div className="relative flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1">
              <p className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <ShieldCheck className="h-4 w-4" /> Role-based access
              </p>
              <h1 className="mt-3 text-4xl font-bold text-gray-900 leading-tight">
                Quản lý căn hộ & Marketplace
              </h1>
              <p className="mt-3 text-gray-600 text-sm">
                Tìm kiếm, thuê hoặc mua căn hộ. Quy trình phê duyệt linh hoạt cho chủ hộ và ban quản lý, trải nghiệm đơn giản cho khách và cư dân.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {!user && (
                  <>
                    <Link to="/marketplace" className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
                      Xem Marketplace
                    </Link>
                    <Link to="/buildings/map" className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700">
                      Bản đồ
                    </Link>
                    <Link to="/login" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      Sign in
                    </Link>
                    <Link to="/register" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      Sign up
                    </Link>
                  </>
                )}
                {user && (
                  <>
                    <Link to="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
                      Vào Dashboard
                    </Link>
                    <Link to="/marketplace" className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700">
                      Marketplace
                    </Link>
                    <Link to="/buildings/map" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                      Interactive Map
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="w-full lg:w-80 bg-white/70 border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold mb-4">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Điểm nổi bật
              </div>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>• Khách/user: xem Marketplace, Map, gửi yêu cầu với thông tin liên hệ.</li>
                <li>• Cư dân: theo dõi yêu cầu, quản lý căn hộ của mình.</li>
                <li>• Chủ hộ: bật/tắt cho thuê/bán, đặt giá.</li>
                <li>• Quản lý: duyệt yêu cầu, quản lý cư dân & user.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {featureCards.map((f) => (
            <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition hover:-translate-y-1">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${f.color} mb-3`}>
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Personas */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {personas.map((p) => (
            <div key={p.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">{p.title}</h3>
              </div>
              <ul className="text-sm text-gray-600 list-disc ml-5 space-y-2">
                {p.points.map((pt) => <li key={pt}>{pt}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

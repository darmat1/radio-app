export default function Profile() {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-sm">Tg</span>
      </div>
      <div>
        <p className="text-white font-medium">TgFM</p>
        <p className="text-gray-400 text-sm">Radio Player</p>
      </div>
    </div>
  );
}
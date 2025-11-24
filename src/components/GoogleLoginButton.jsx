export default function GoogleLoginButton() {
  return (
    <button className="w-full bg-white border-2 border-gray-300 py-3 rounded-lg font-bold flex items-center justify-center gap-3 hover:shadow-lg transition">
      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
      Continue with Google
    </button>
  );
}
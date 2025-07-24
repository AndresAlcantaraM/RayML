const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-indigo-300 border-b-transparent rounded-full animate-spin-reverse"></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-700">Procesando datos...</p>
        <p className="text-sm text-gray-500">Esto puede tomar unos momentos</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
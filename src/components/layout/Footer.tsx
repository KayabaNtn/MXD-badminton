export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-xl">🏸</span>
                        <span className="text-sm">
                            Câu lạc bộ cầu lông MXD Badminton
                        </span>
                    </div>
                    <div className="text-sm text-gray-500">
                        © {new Date().getFullYear()} by NhatNT
                    </div>
                </div>
            </div>
        </footer>
    );
}
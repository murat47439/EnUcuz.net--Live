"use client";
import { useState } from "react";
import { Search } from "lucide-react";



interface SearchBarProbs {
    onSearchSubmit: (searchTerm: string) => void;
}

const SearchBar = ({ onSearchSubmit }: SearchBarProbs) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearchSubmit(searchTerm)

    };
    const handleSearchChange = (e: React.ChangeEvent<HTMLFormElement>) => {
        setSearchTerm(e.target.value)
        setTimeout(() => {
            onSearchSubmit(searchTerm)
        }, 500)
    }


    return (
        <form onSubmit={handleSearch} onChange={handleSearchChange} className="w-full max-w-2xl mx-auto mb-8">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={18}></Search>
                </div>
                <input type="text" placeholder="Ürün, marka veya kategori ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-[#ff6000]/20 focus:border-[#ff6000] transition-all outline-none"
                />
            </div>
        </form>
    )
};

export default SearchBar;
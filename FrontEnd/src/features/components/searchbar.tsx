"use client";
import { useState } from "react";
import { Search } from "lucide-react";



interface SearchBarProbs{
    onSearchSubmit: (searchTerm:string) => void;
}

const SearchBar = ({onSearchSubmit} : SearchBarProbs) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        onSearchSubmit(searchTerm)
                      
    };
    const handleSearchChange = (e: React.ChangeEvent<HTMLFormElement>) =>{
        setSearchTerm (e.target.value)
        setTimeout(() => {
            onSearchSubmit(searchTerm)
        }, 500)
    }


    return(
        <form onSubmit={handleSearch} onChange={handleSearchChange} className="w-full max-w-2xl mx-auto mb-8">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={20}></Search>
                </div>
                <input type="text" placeholder="Ürün ara..." value={searchTerm} onChange={ (e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" 
                />
            </div>
        </form>
    )
};

export default SearchBar;
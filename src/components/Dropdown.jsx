import { useState } from "react";

const Dropdown = ({ label, options = [], selected, onSelect }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative inline-block text-left">
            <div>
                <button
                    onClick={() => setOpen(!open)}
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border px-4 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-500 dark:text-gray-50 dark:border-gray-400 dark:placeholder-gray-200 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                    id="menu-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                >
                    {selected ? options.find(o => o.id === selected)?.displayName : label}
                    <svg
                        className="-mr-1 ml-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>
            </div>

            <div
                className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-50 dark:bg-gray-500 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
                    open ? "" : "hidden"
                }`}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
                tabIndex="-1"
            >
                <div className="py-1" role="none">
                    {options.map((option) => (
                        <div
                            onClick={() => {
                                setOpen(false);
                                onSelect(option.id);
                            }}
                            className={`cursor-pointer bg-gray-50 dark:bg-gray-500 dark:text-gray-50 dark:border-gray-400 dark:placeholder-gray-200 dark:hover:bg-gray-600 block px-4 py-2 text-sm ${
                                option.id === selected ? "bg-gray-500" : ""
                            }`}
                            key={option.id}
                            role="menuitem"
                            tabIndex="-1"
                            id="menu-item-0"
                        >
                            {option.displayName}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dropdown;

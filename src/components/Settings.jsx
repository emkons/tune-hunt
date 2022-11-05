import { saveAs } from "file-saver";
import { clearDatabase, exportToJsonString, importFromJsonString } from "indexeddb-export-import";
import moment from "moment";
import React from "react";
import { useState } from "react";
import { db } from "../db";

const Settings = ({ onClose }) => {

    const [selectedFile, setSelectedFile] = useState(null)
    const [error, setError] = useState('')

    const handleExport = () => {
        console.log('Exporting...')
        setError('')
        db.open().then(function() {
            const idbDatabase = db.backendDB(); // get native IDBDatabase object from Dexie wrapper
          
            // export to JSON, clear database, and import from JSON
            exportToJsonString(idbDatabase, function(err, jsonString) {
              if (err) {
                setError(err)
                console.error(err);
              } else {
                const fileToSave = new Blob([jsonString], {
                    type: 'application/json'
                });
                const date = moment().subtract(150, 'minutes').format("YYYY-MM-DD");
                saveAs(fileToSave, `spotdle-history-${date}.json`)
              }
            });
          }).catch(function(e) {
            setError('Could not connect.')
            console.error('Could not connect. ' + e);
          });
    }

    const handleImport = () => {
        setError('')
        console.log('Importing...')
        if (!selectedFile) {
            setError('No file selected')
            return
        }
        
        db.open().then(function() {
            const idbDatabase = db.backendDB(); // get native IDBDatabase object from Dexie wrapper
          
            const fr = new FileReader();

            fr.onload = (e) => {
                const jsonString = e.target.result
                clearDatabase(idbDatabase, function(err) {
                    if (!err) { // cleared data successfully
                        importFromJsonString(idbDatabase, jsonString, function(err) {
                            if (!err) {
                                setError('Imported data successfully. Refresh page to see new data');
                            }
                        });
                    }
                });
            };
            
            fr.readAsText(selectedFile);
          }).catch(function(e) {
            setError('Could not connect.')
            console.error('Could not connect. ' + e);
          });
    }

    const handleUpload = (event) => {
        setSelectedFile(event.target.files[0])
    }

    return (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-900/75">
            <div className="relative bg-gray-700 text-white rounded w-1/2 p-8">
                <div
                    className="absolute top-4 right-4 cursor-pointer"
                    onClick={() => onClose()}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
                <div>
                    <div className="text-2xl text-white text-center leading-tight mb-4">
                        Settings
                    </div>
                    <div className="bg-gray-800/20 p-2 rounded">
                        <div className="flex flex-col gap-3">
                            <div className="">
                                <button className="bg-gray-500 p-3 rounded" onClick={() => handleExport()}>Export</button>
                            </div>
                            <div className="flex gap-3 items-center">
                                <button className="bg-gray-500 p-3 rounded" onClick={() => handleImport()}>Import</button>
                                <input type="file" onChange={handleUpload} />
                            </div>
                            {error ? error : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

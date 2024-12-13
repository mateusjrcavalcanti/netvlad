import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/recognize-place', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setResult(data);
  };

  return (
   <div className='container mx-auto'>  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
   <h1>Place Recognition</h1>
   <form onSubmit={handleSubmit}>
     <input type="file" onChange={handleFileChange} />
     <button type="submit" style={{ marginLeft: '10px' }}>Submit</button>
   </form>

   {result && (
     <div style={{ marginTop: '20px' }}>
       <h2>Result</h2>
       <pre>{JSON.stringify(result, null, 2)}</pre>
     </div>
   )}
 </div></div>
  );
}

export default App;

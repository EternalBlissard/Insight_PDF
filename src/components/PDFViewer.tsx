import React from 'react'

type Props = {
    pdfUrl: string;
}

const PDFViewer = (props: Props) => {
    const encodedPdfUrl = encodeURIComponent(props.pdfUrl);
    // console.log(encodedPdfUrl , "encodedPdfUrl");
  return (
    <iframe 
  src={`https://docs.google.com/gview?url=${encodedPdfUrl}&embedded=true`}
  className='w-full h-full'
  title="PDF Viewer"
  frameBorder="0"
>
</iframe>

  )
}

export default PDFViewer
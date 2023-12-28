import '@styles/globals.css';

export const metadata = {
    title: "Gitulyse",
    description: 'Code reporting and summary'
}
const Rootlayout = ({children}) => {
  return (
    <html lang="en">
        <body>
            <div className='main'>
                <div className='gradient' />
            </div>

            <main className='app'>
                {children}
            </main>
        </body>

    </html>
  )
}

export default Rootlayout;
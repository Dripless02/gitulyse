import React from 'react'
import Search from '@components/Search';

const Home = () => {
  return (
    <section className='w-full flex-center flex-col'>
      <h1 className="head_text text-center">
        Gitulyse
        <br className='max-md: hidden' />
        <span className='blue_gradient'> Code Summarization and Reporting Tool</span>
      </h1>
      <Search/>
    </section>
  )
}

export default Home;
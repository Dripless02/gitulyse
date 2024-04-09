// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import Home from '@app/page.jsx';

// // Mocking next-auth/react useSession function
// jest.mock('next-auth/react', () => ({
//   useSession: jest.fn(),
//   getSession: jest.fn()
// }));

// describe('Page', () => {
//   test('renders unauthenticated content', async () => {
//     // Mock unauthenticated session
//     const useSessionMock = { status: 'unauthenticated' };
//     jest.spyOn(React, 'useEffect').mockImplementationOnce(f => f());
//     jest.spyOn(React, 'useState').mockReturnValueOnce([null, jest.fn()]); // Mocking user state
//     jest.spyOn(React, 'useState').mockReturnValueOnce(['', jest.fn()]); // Mocking userAccessToken state
//     jest.spyOn(React, 'useEffect').mockImplementationOnce(f => f()); // Mocking useEffect to avoid infinite loop
//     jest.spyOn(React, 'useState').mockReturnValueOnce([useSessionMock, jest.fn()]); // Mocking useSession hook
//     render(<Home />);

//     // Assertion
//     expect(screen.getByText(/Gitulyse/i)).toBeInTheDocument();
//     expect(screen.getByText(/Search for a repository or user/i)).toBeInTheDocument();
//     expect(screen.getByText(/Sign in with your Github/i)).toBeInTheDocument();
//   });

// });

import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '@app/page'

describe('Page', () => {
  it('renders a heading', () => {
    render(<Page />)

    const heading = screen.getByRole('heading', { level: 1 })

    expect(heading).toBeInTheDocument()
  })
})
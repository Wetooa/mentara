import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders accessible label', () => {
    render(React.createElement(Button, { type: 'button' }, 'Submit'));
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });
});

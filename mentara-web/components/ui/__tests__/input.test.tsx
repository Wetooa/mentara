import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input Component', () => {
  it('renders with default styling', () => {
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('flex', 'h-9', 'w-full', 'rounded-md', 'border');
  });

  it('handles text input correctly', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    
    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'Hello World');
    
    expect(input).toHaveValue('Hello World');
  });

  it('handles onChange events', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    
    render(<Input onChange={handleChange} placeholder="Test input" />);
    
    const input = screen.getByPlaceholderText('Test input');
    await user.type(input, 'test');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders with different input types', () => {
    const { rerender } = render(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');

    rerender(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email');

    rerender(<Input type="number" placeholder="Number" />);
    expect(screen.getByPlaceholderText('Number')).toHaveAttribute('type', 'number');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled input" />);
    
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Custom" />);
    
    const input = screen.getByPlaceholderText('Custom');
    expect(input).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(
      <Input 
        aria-label="Search field"
        aria-describedby="search-help"
        placeholder="Search..."
      />
    );
    
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toHaveAttribute('aria-label', 'Search field');
    expect(input).toHaveAttribute('aria-describedby', 'search-help');
    expect(input).toHaveAttribute('data-slot', 'input');
  });

  it('handles focus and blur events', async () => {
    const user = userEvent.setup();
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(
      <Input 
        onFocus={handleFocus} 
        onBlur={handleBlur}
        placeholder="Focus test"
      />
    );
    
    const input = screen.getByPlaceholderText('Focus test');
    
    await user.click(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('renders with different variants', () => {
    render(<Input variant="default" placeholder="Default variant" />);
    
    const input = screen.getByPlaceholderText('Default variant');
    expect(input).toHaveClass('text-[8px]');
  });

  it('supports controlled input', async () => {
    const user = userEvent.setup();
    let value = 'initial';
    const setValue = jest.fn((newValue) => {
      value = newValue;
    });
    
    const ControlledInput = () => (
      <Input 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Controlled"
      />
    );
    
    render(<ControlledInput />);
    
    const input = screen.getByPlaceholderText('Controlled');
    expect(input).toHaveValue('initial');
    
    await user.clear(input);
    await user.type(input, 'new value');
    
    expect(setValue).toHaveBeenCalled();
  });

  it('handles file input type', () => {
    render(<Input type="file" accept=".jpg,.png" />);
    
    const input = screen.getByRole('textbox', { hidden: true });
    expect(input).toHaveAttribute('type', 'file');
    expect(input).toHaveAttribute('accept', '.jpg,.png');
  });

  it('renders with required attribute', () => {
    render(<Input required placeholder="Required field" />);
    
    const input = screen.getByPlaceholderText('Required field');
    expect(input).toBeRequired();
  });

  it('applies focus styles correctly', () => {
    render(<Input placeholder="Focus styles" />);
    
    const input = screen.getByPlaceholderText('Focus styles');
    expect(input).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-ring/50');
  });
});
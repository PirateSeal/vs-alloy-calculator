import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';

describe('Card primitives', () => {
  it('renders all parts with merged className and children', () => {
    const { getByText, container } = render(
      <Card className="custom-card">
        <CardHeader className="custom-header">
          <CardTitle className="custom-title">Title</CardTitle>
          <CardDescription className="custom-desc">Desc</CardDescription>
        </CardHeader>
        <CardContent className="custom-content">Body</CardContent>
        <CardFooter className="custom-footer">Footer</CardFooter>
      </Card>,
    );

    expect(container.querySelector('.custom-card')).not.toBeNull();
    expect(container.querySelector('.custom-header')).not.toBeNull();
    expect(getByText('Title').className).toContain('custom-title');
    expect(getByText('Desc').className).toContain('custom-desc');
    expect(getByText('Body').className).toContain('custom-content');
    expect(getByText('Footer').className).toContain('custom-footer');
  });
});

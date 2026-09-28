import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  let fixture: ComponentFixture<AvatarComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    host = fixture.nativeElement;
  });

  it('renders normalized initials with the medium size by default', () => {
    fixture.componentRef.setInput('initials', ' mar ');
    fixture.detectChanges();

    expect(host.classList).toContain('nvs-avatar--medium');
    expect(host.textContent?.trim()).toBe('MA');
  });

  it('applies the size class', () => {
    fixture.componentRef.setInput('size', 'large');
    fixture.detectChanges();

    expect(host.classList).toContain('nvs-avatar--large');
  });

  it('is decorative without a name', () => {
    fixture.detectChanges();

    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.hasAttribute('role')).toBe(false);
  });

  it('is announced as an image when it has a name', () => {
    fixture.componentRef.setInput('name', 'María Álvarez');
    fixture.detectChanges();

    expect(host.getAttribute('role')).toBe('img');
    expect(host.getAttribute('aria-label')).toBe('María Álvarez');
    expect(host.hasAttribute('aria-hidden')).toBe(false);
  });

  it('shows the image and falls back to initials if it fails', () => {
    fixture.componentRef.setInput('initials', 'MA');
    fixture.componentRef.setInput('imageUrl', '/broken.png');
    fixture.detectChanges();

    const image = host.querySelector('img') as HTMLImageElement;
    expect(image.getAttribute('alt')).toBe('');

    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(host.querySelector('img')).toBeNull();
    expect(host.textContent?.trim()).toBe('MA');

    fixture.componentRef.setInput('imageUrl', '/another.png');
    fixture.detectChanges();
    expect(host.querySelector('img')).toBeTruthy();
  });
});

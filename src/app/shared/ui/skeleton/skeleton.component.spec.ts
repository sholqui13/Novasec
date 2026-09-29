import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  let fixture: ComponentFixture<SkeletonComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonComponent);
    host = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('is decorative and hidden from assistive technology', () => {
    expect(host.classList).toContain('nvs-skeleton');
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('supports a subtle tone', () => {
    expect(host.classList).not.toContain('nvs-skeleton--subtle');

    fixture.componentRef.setInput('tone', 'subtle');
    fixture.detectChanges();

    expect(host.classList).toContain('nvs-skeleton--subtle');
  });
});

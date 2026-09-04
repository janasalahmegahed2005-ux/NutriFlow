import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FoodDiary } from './food-diary';

describe('FoodDiary', () => {
  let component: FoodDiary;
  let fixture: ComponentFixture<FoodDiary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoodDiary],
    }).compileComponents();

    fixture = TestBed.createComponent(FoodDiary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

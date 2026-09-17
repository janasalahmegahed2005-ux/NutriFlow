import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MealPlannerDayComponent } from './meal-planner-day';

describe('MealPlannerDayComponent', () => {
  let component: MealPlannerDayComponent;
  let fixture: ComponentFixture<MealPlannerDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MealPlannerDayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MealPlannerDayComponent);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
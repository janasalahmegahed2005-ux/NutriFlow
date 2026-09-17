import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-meal-planner-day',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './meal-planner-day.html',
  styleUrl: './meal-planner-day.css'
})
export class MealPlannerDayComponent implements OnInit {

  selectedDate: Date | null = null;

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const dateParam = params.get('date');

      if (dateParam) {

        const date =
          new Date(`${dateParam}T00:00:00`);

        if (!isNaN(date.getTime())) {

          this.selectedDate = date;

        }

      }

    });

  }

}

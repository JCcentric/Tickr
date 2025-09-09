// RecurringTickr.ts
import { Tickr } from './Tickr';

export class RecurringTickr extends Tickr {
    private recurrence: 'daily' | 'weekly' | 'monthly';

    constructor(title: string, description: string, date: Date, imageUrl: string | null, recurrence: 'daily' | 'weekly' | 'monthly') {
        super(title, description, date, imageUrl === null ? undefined : imageUrl); // inherit from Tickr
        this.recurrence = recurrence;
    }

    public getRecurrence(): string {
        return this.recurrence;
    }

    public setRecurrence(value: 'daily' | 'weekly' | 'monthly') {
        this.recurrence = value;
    }

    // Polymorphism: override parent method
    public toFirestore() {
        return {
            ...super.toFirestore(), // include Tickr fields
            recurrence: this.recurrence
        };
    }
}

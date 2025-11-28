export class Tickr {
  private title: string;
  private description: string;
  private date: Date;
  private imageUrl: string | null;

  constructor(title: string, description: string, date: Date, imageUrl?: string) {
    this.title = title;
    this.description = description;
    this.date = date;
    this.imageUrl = imageUrl || null;
  }

  // Getters
  getTitle() { return this.title; }
  getDescription() { return this.description; }
  getDate() { return this.date; }
  getImageUrl() { return this.imageUrl; }

  // Setters
  setTitle(title: string) { this.title = title; }
  setDescription(description: string) { this.description = description; }
  setDate(date: Date) { this.date = date; }
  setImageUrl(url: string) { this.imageUrl = url; }

  // Utility function
  toFirestore() {
    return {
      title: this.title,
      description: this.description,
      date: this.date.toISOString(),
      imageUrl: this.imageUrl,
    };
  }
}

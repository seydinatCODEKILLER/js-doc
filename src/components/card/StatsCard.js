export class StatsCard {
  constructor({ title, value, icon, color }) {
    this.config = { title, value, icon, color };
  }

  render() {
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-800 rounded-lg shadow p-6";
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">${this.config.title}</p>
          <h3 class="text-2xl font-bold text-gray-800 dark:text-white mt-1">${this.config.value}</h3>
        </div>
        <div class="p-3 rounded-full ${this.config.color}">
          <i class="${this.config.icon} text-xl"></i>
        </div>
      </div>
    `;
    return card;
  }
}

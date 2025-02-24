document.addEventListener("DOMContentLoaded", function () {
  // Lazy Loading Images with IntersectionObserver
  // const lazyImages = document.querySelectorAll("img.lazy");
  // if ("IntersectionObserver" in window) {
  //   const lazyImageObserver = new IntersectionObserver((entries, observer) => {
  //     entries.forEach(entry => {
  //       if (entry.isIntersecting) {
  //         const img = entry.target;
  //         img.src = img.dataset.src; // Load the real image
  //         img.classList.remove("lazy");
  //         lazyImageObserver.unobserve(img);
  //       }
  //     });
  //   });
  //   lazyImages.forEach(img => {
  //     lazyImageObserver.observe(img);
  //   });
  // } else {
  //   // Fallback for browsers without IntersectionObserver support
  //   lazyImages.forEach(img => {
  //     img.src = img.dataset.src;
  //     img.classList.remove("lazy");
  //   });
  // }

  // Cache DOM elements for the shop functionality
  const foodGrid = document.querySelector(".food-grid");
  const foodCards = document.querySelectorAll(".food-card");
  const totalPriceEl = document.querySelector(".total-price");
  const orderButton = document.querySelector(".order-button");

  /**
   * parsePrice:
   * Converts a string like "35 000 som" into a number (35000).
   */
  function parsePrice(priceStr) {
    return parseInt(priceStr.replace(/[^\d]/g, ""), 10);
  }

  /**
   * updateTotalPrice:
   * Iterates through each food card and recalculates the total price.
   */
  function updateTotalPrice() {
    let total = 0;
    foodCards.forEach(card => {
      const priceText = card.querySelector(".food-price").textContent.trim();
      const price = parsePrice(priceText);
      const qty = parseInt(card.querySelector(".quantity").textContent, 10);
      total += price * qty;
    });
    totalPriceEl.textContent = total.toLocaleString("en-US") + " som";
  }

  /**
   * Event Delegation for Quantity Buttons:
   * Uses a single listener on the food-grid container for all increment and decrement clicks.
   */
  foodGrid.addEventListener("click", function (e) {
    if (e.target.classList.contains("increment") || e.target.classList.contains("decrement")) {
      const card = e.target.closest(".food-card");
      if (!card) return;

      const quantitySpan = card.querySelector(".quantity");
      let qty = parseInt(quantitySpan.textContent, 10);

      if (e.target.classList.contains("increment")) {
        qty++;
      } else if (e.target.classList.contains("decrement") && qty > 0) {
        qty--;
      }

      quantitySpan.textContent = qty;
      updateTotalPrice();
    }
  });

  /**
   * Order Button Click Handler:
   * Compiles the order and sends data to the Telegram bot (if available).
   */
  orderButton.addEventListener("click", function () {
    orderButton.classList.add("animate");

    orderButton.addEventListener("animationend", function () {
      orderButton.classList.remove("animate");
    });

    setTimeout(() => {
      let orderSummary = [];
      foodCards.forEach(card => {
        const title = card.querySelector(".food-title").textContent.trim();
        const quantity = parseInt(card.querySelector(".quantity").textContent, 10);
        if (quantity > 0) {
          orderSummary.push(`${title}: ${quantity}`);
        }
      });

      if (orderSummary.length === 0) {
        alert("Please choose at least one item to order.");
        return;
      }

      const summaryData = {
        items: orderSummary,
        total: totalPriceEl.textContent,
      };

      if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify(summaryData));
      } else {
        alert("This page is NOT opened as a Telegram WebApp.");
      }
    }, 250);
  });

  // Initialize the total price calculation on DOM load.
  updateTotalPrice();
});

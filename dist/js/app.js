document.addEventListener("DOMContentLoaded", () => {
   makeCartShutter();
   makeOrderTemplate();
});

function makeCartShutter() {
   const shutter = document.querySelector(".cart-shutter");
   const container = document.querySelector(".cart-content__items");
   if (!shutter) return;
   const checkScroll = () => {
      return (
         container.getBoundingClientRect().top -
            window.innerHeight +
            container.getBoundingClientRect().height >
         0
      );
   };
   window.addEventListener("scroll", () => {
      if (checkScroll()) {
         shutter.classList.add("show");
      } else {
         shutter.classList.remove("show");
      }
   });
}

function makeOrderTemplate() {
   const citySelect = new Select("#orderCitySelect", {
      placeholder: "Введите город доставки",
      // selectedId: "volg",
      data: [
         {
            id: "toyota",
            value: "Волгоград город герой",
         },
         {
            id: "kia",
            value: "Батуми",
         },
         {
            id: "kia1",
            value: "Краснодар",
         },
         {
            id: "kia2",
            value: "Москва",
         },
      ],
      onSelect(item, select) {
         select.classList.add("filled");
         makeItemsActive();
      },
   });
   const inputs = document.querySelectorAll('[name="orderDelivery"]');
   if (!inputs.length) return;
   const makeItemsActive = () => {
      document.querySelectorAll(".delivery-card").forEach((item) => {
         item.classList.add("allowed");
      });
   };

   const changeHandler = (e) => {
      const contents = document.querySelectorAll("[data-delivery-for]");
      contents.forEach((item) => {
         if (item.getAttribute("data-delivery-for") == e.target.value) {
            item.classList.add("active");
         } else {
            item.classList.remove("active");
         }
      });
   };
   inputs.forEach((item) => {
      item.addEventListener("change", changeHandler);
   });
}

const maskOptions = {
   mask: "+{7} (000) 000-00-00",
   // lazy: false,  // make placeholder always visible
   // placeholderChar: '0'     // defaults to '_'
};
if (document.querySelectorAll("[data-phone]").length) {
   document.querySelectorAll("[data-phone]").forEach((item) => {
      const mask = IMask(item, maskOptions);
   });
}

class Select {
   constructor(selector, options) {
      this.$el = document.querySelector(selector);
      this.options = options;
      this.selectedId = options.selectedId;

      this.#render();
      this.#setup();
   }
   #render() {
      this.$el.classList.add("select");
      const { placeholder, data, selectedId } = this.options;
      this.$el.innerHTML = this.getTemplate(data, placeholder, selectedId);
      if (placeholder) {
         this.$el
            .querySelector(`[data-type="input"]`)
            .classList.add("placeholder");
      }
   }
   #setup() {
      this.clickHandler = this.clickHandler.bind(this);
      this.$el.addEventListener("click", this.clickHandler);
      this.$value = this.$el.querySelector(`[data-type="input"] span`);
   }
   clickHandler(event) {
      const { type } = event.target.dataset;
      if (type === "input") {
         this.toggle();
      } else if (type === "item") {
         const { id } = event.target.dataset;
         this.select(id);
      } else if (type === "back") {
         this.toggle();
      } else if (type === "header") {
         this.toggle();
      } else if (event.target.closest(".select__header")) [this.toggle()];
   }
   get current() {
      return this.options.data.find((item) => item.id === this.selectedId);
   }
   select(id) {
      this.$el
         .querySelector(`[data-type="input"]`)
         .classList.remove("placeholder");
      this.selectedId = id;
      this.$value.innerHTML = this.current.value;
      this.$el.querySelectorAll(`[data-type="item"]`).forEach((item) => {
         item.classList.remove("selected");
      });
      this.$el
         .querySelector(`[data-id =${this.current.id}]`)
         .classList.add("selected");
      this.close();

      if (this.options.onSelect) {
         this.options.onSelect(this.current, this.$el);
      }
   }
   open() {
      this.$el.classList.add("open");
   }
   close() {
      this.$el.classList.remove("open");
   }
   toggle() {
      if (this.$el.classList.contains("open")) {
         this.close();
      } else {
         this.open();
      }
   }
   getTemplate(data, placeholder = `<span></span>`, selectedId) {
      const items = data.map((item) => {
         let cls = "";
         if (item.id === selectedId) {
            placeholder = item.value;
            cls = "selected";
         }
         return `<li class="select__item ${cls}" data-type="item" data-id="${item.id}">${item.value}</li>`;
      });
      return `
      <div class="select__header" data-type="header">
      <div class="select__back" data-type="back"></div>
      <div class="select__title" data-type="input">
         <span>${placeholder}</span>
         <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="#0E0E0E" stroke-linecap="round"/>
         </svg>
    </div>
      </div>
      <div class="select__content">
         <ul class="select__list">
            ${items.join("")}
         </ul>
      </div>
      `;
   }
}

// Popup
const popupLinks = document.querySelectorAll(".modal__link");
const body = document.querySelector("body");
const lockPadding = document.querySelectorAll(".lock-padding");
const popupCloseIcon = document.querySelectorAll(".modal__close");

let unlock = true;

const timeout = 500;

if (popupLinks.length > 0) {
   for (let index = 0; index < popupLinks.length; index++) {
      const popupLink = popupLinks[index];
      popupLink.addEventListener("click", function (e) {
         const popupName = popupLink.getAttribute("href").replace("#", "");
         const curentPopup = document.getElementById(popupName);
         popupOpen(curentPopup);
         e.preventDefault();
      });
   }
}

if (popupCloseIcon.length > 0) {
   for (let index = 0; index < popupCloseIcon.length; index++) {
      const el = popupCloseIcon[index];
      el.addEventListener("click", function (e) {
         popupClose(el.closest(".modal"));
         e.preventDefault();
      });
   }
}

function popupOpen(curentPopup) {
   if (curentPopup && unlock) {
      const popupActive = document.querySelector(".modal.open");
      if (popupActive) {
         popupClose(popupActive, false);
      } else {
         bodyLock();
      }
      curentPopup.classList.add("open");
      curentPopup.addEventListener("click", function (e) {
         if (!e.target.closest(".modal__content")) {
            popupClose(e.target.closest(".modal"));
         }
      });
   }
}
function popupClose(popupActive, doUnlock = true) {
   if (unlock) {
      popupActive.classList.remove("open");
      if (doUnlock) {
         bodyUnLock();
      }
   }
}

function bodyLock() {
   const lockPaddingValue =
      window.innerWidth - document.querySelector(".wrapper").offsetWidth + "px";

   if (lockPadding.length > 0) {
      for (let index = 0; index < lockPadding.length; index++) {
         const el = lockPadding[index];
         el.style.paddingRight = lockPaddingValue;
      }
   }
   body.style.paddingRight = lockPaddingValue;
   body.classList.add("lock");

   unlock = false;
   setTimeout(function () {
      unlock = true;
   }, timeout);
}

function bodyUnLock() {
   setTimeout(function () {
      if (lockPadding.length > 0) {
         for (let index = 0; index < lockPadding.length; index++) {
            const el = lockPadding[index];
            el.style.paddingRight = "0px";
         }
      }
      body.style.paddingRight = "0px";
      body.classList.remove("lock");
   }, timeout);

   unlock = false;
   setTimeout(function () {
      unlock = true;
   }, timeout);
}

document.addEventListener("keydown", function (e) {
   if (e.which === 27) {
      const popupActive = document.querySelector(".modal.open");
      popupClose(popupActive);
   }
});

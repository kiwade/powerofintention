/**
 * FUNCTIONS
 */

// Device Detection
const mobile =
  /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(
    navigator.userAgent.toLowerCase()
  );
const ios = /(iPad|iPhone|iPod)/i.test(navigator.userAgent.toLowerCase());
const android = /android/i.test(navigator.userAgent.toLowerCase());

function mobileNav() {
  var element = document.getElementById("myDIV");
  element.classList.add("mystyle");
}

/**
 * PAGE LOAD
 */
window.onload = function () {
  const body = document.body;
  const html = document.documentElement;

  // Device Detection For Mobile
  if (mobile) {
    html.classList.add("mobile-device");
  } else if (ios) {
    html.classList.add("device-ios");
  } else if (android) {
    html.classList.add("device-android");
  }

  // Mobile Safari Hack for 100vh
  if (mobile) {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    window.addEventListener("resize", () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    });
  }
  window.onscroll = function () {
    let scrollPosition = window.scrollY;
    let navigation = document.getElementsByTagName("nav")[0];

    if (scrollPosition >= 5) {
      navigation.classList.add("scrolled");
    } else {
      navigation.classList.remove("scrolled");
    }

    let scrollTop =
      window.pageYOffset !== undefined
        ? window.pageYOffset
        : (
            document.documentElement ||
            document.body.parentNode ||
            document.body
          ).scrollTop;

    document.querySelectorAll(".fade-out-slow").forEach(function (element) {
      let height = window.innerHeight;
      // Change this if you want it to fade faster
      height = height / 0.75;
      element.style.opacity = (height - scrollTop) / height;
    });

    document.querySelectorAll(".fade-out-fast").forEach(function (element) {
      let height = window.innerHeight;
      // Change this if you want it to fade faster
      height = height / 1;
      element.style.opacity = (height - scrollTop) / height;
    });
  };

  // let sizes = [
  //   { columns: 1, gutter: 20 },
  //   { mq: "601px", columns: 2, gutter: 20 },
  //   { mq: "1200px", columns: 3, gutter: 20 },
  // ];

  // let brickInstance = bricks({
  //   container: ".quotes",
  //   packed: "data-packed",
  //   sizes: sizes,
  // });

  // brickInstance.pack();

  // window.onresize = function () {
  //   brickInstance.pack();
  // };

  // Check Navigation location on load
  let scrollPosition = window.scrollY;
  let navigation = document.getElementsByTagName("nav")[0];
  if (scrollPosition >= 5) {
    navigation.classList.add("scrolled");
  } else {
    navigation.classList.remove("scrolled");
  }

  // Set Copyright Date
  let date = document.getElementById("date");
  if (date) {
    date.innerHTML = new Date().getFullYear();
  }

  // Collapsible
  var elems = document.querySelectorAll(".collapsible");
  M.Collapsible.init(elems, { accordion: false });

  // Parallax
  // This should be .parallax-image and not .parallax
  let image = document.querySelectorAll(".parallax");
  new simpleParallax(image, {
    scale: 1.15,
  });
};

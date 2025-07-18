// Wait for the DOM to finish loading before running

document.addEventListener('DOMContentLoaded', function() {

    // --------------------- EmailJS

    // ------------ Initialise EmailJs service

    (function(){
        emailjs.init({
          publicKey: "bDpJggHvGJ6gMBrgc",
        });
     })();

    //  ------------------ Contact forms

    /* Get contact form(s) from the page and if found, pass to handler
       function */

    const contactForms = document.querySelectorAll('.contact-form');

    if (contactForms.length > 0) {
        for (let form of contactForms) {
            handleContactFormEmailJS(form);
        }
    }

    /* Get Google reCAPTCHA(s) from the page and if found, pass to
       handler function for resizing */
    
    const captchas = document.querySelectorAll('.g-recaptcha');

    if (captchas.length > 0) {
        for (let captcha of captchas) {
            /* have to use jquery '.on' instead of 'addEventListener'
               for Bootstrap 4.3 modal events compatability */
            $('#email-info-modal').on('shown.bs.modal', () => resizeCaptcha(captcha));
            window.addEventListener('resize', () => resizeCaptcha(captcha));
        }
    }

    // -------------------- Main menu

    /* Get main menu from the DOM and pass to handler functions if
       found */

    const menu = document.querySelector('#main-menu');

    if (menu) {
        // Set initial aria properties based on screen size
        handleMainMenuAria (menu);

        // Handle main dropdown menu behaviour (event listeners)
        handleMainMenuDropdown(menu);
    }

    // ----------------- Navigation dropdowns

    /* Get all navigation dropdown lists from the page and if found, pass each
       one to handler function */

    const dropdowns = document.querySelectorAll('.navbar-dropdown-menu-container');

    if (dropdowns.length > 0) {
        for (let dropdown of dropdowns) {
            handleDropdownMenu(dropdown);
        }
    }

    /* Get all navigation dropdown list link from the page and, if found, get any
       sections from the page that they might link to. If sections found, pass both
       lists to handler function along with appropriate 'active' class for styling */

    const navbarDropdownLinks = document.querySelectorAll('.navbar-dropdown-item');
    const activeClass = 'active-link'

    if (navbarDropdownLinks.length > 0) {
        const navbarLinkedEls = document.querySelectorAll('.navbar-linked-section');
        if (navbarLinkedEls.length > 0) {
            handleActiveLinkStyleOnScroll(navbarDropdownLinks, navbarLinkedEls, activeClass);
        }
    }

    // ---------------------- Footer

    // Set current year in copyright statement if found

    const copYears = document.querySelectorAll('.copyright-year');
    
    if (copYears.length > 0) {
        for (let copYear of copYears) {
            copYear.innerHTML = new Date().getFullYear();
        }
    }

    // ---------------------- Modals

    const modals = document.querySelectorAll('.modal');

    if (modals.length > 0) {
        for (let modal of modals) {
            trapKeyNavFocus(modal);
        }
    }

    // --------------- Collapsible sections

    const collapseSections = document.querySelectorAll('.collapse-section');

    if (collapseSections.length > 0) {
        for (let section of collapseSections) {
            handleCollapseSection(section);
        }
    }

    // ------------------- Landing Page

    /* Get landing page banner image and, if found, pass to page header logo
       handler function */
    
    const landingBannerImgWrap = document.querySelector('#landing-banner-img');

    if (landingBannerImgWrap) {
        handleHeaderLogoDisplay(landingBannerImgWrap);
    }

    // ---------------- Bootstrap Accordions

    /* Get all Bootstrap 'accordion' components from the page and if found,
       pass each one to handler function */

    // const accordions = document.querySelectorAll('.accordion');

    // if (accordions.length > 0) {
    //     for (let accordion of accordions) {
    //         handleBootstrapAccordionPageBreach(accordion);
    //     }
    // }
    
});

// -------------------- Handler functions

// ------------------------ Main menu

/**
 * Get main menu button, items list and navigation links. Set their
 * initial aria and focus properties based on screen width (i.e. if
 * in dropdown menu mode).
 * 
 * Add event listener to set aria and focus properties of all
 * elements if screen is resized (e.g. mobile device flipped
 * between portrait & landscape mode).
 * 
 * @param {HTMLElement} menu - Main header navigation menu nav element.
 */
 function handleMainMenuAria (menu) {
    const button = menu.querySelector('#main-menu-btn')
    const dropdown = menu.querySelector('#main-menu-items');
    const menuOpenClass = 'main-menu-open';
    const links = dropdown.querySelectorAll('.main-menu-item');

    if (window.innerWidth <= 768) {
        handlePopupAria(button, menuOpenClass);
    }
       
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            button.setAttribute('aria-expanded', 'false');
            dropdown.removeAttribute('aria-hidden');
            for (let link of links) {
                link.removeAttribute('tabindex');
            }
        } else {
            handlePopupAria(button, menuOpenClass);
        }
    });
}

/**
 * Get main header navigation menu toggle button. Set names of
 * toggle button's 'active' class and dropdown menu's 'menu open'
 * class.
 * 
 * Pass toggle button and both class names to handlePopup function.
 * 
 * @param {HTMLElement} menu - Main header navigation menu nav element. 
 */
function handleMainMenuDropdown(menu) {
    const button = menu.querySelector('#main-menu-btn');
    const buttonActiveClass = 'menu-toggle-btn-active';
    const menuOpenClass = 'main-menu-open';

    handlePopup(button, buttonActiveClass, menuOpenClass);
}

// ------------------- Main menu functions end

// ----------------- Navigation dropdown functions

/**
 * Get passed-in dropdown's toggle button and set button 'active'
 * class name. Set dropdown's menu 'open' class name and get menu
 * links.
 * 
 * Pass toggle button and class name(s) to handlePopup and
 * handleDropdownAria functions.
 * 
 * Add event listener to close dropdowns and set appropriate aria 
 * properties if screen is resized (e.g. mobile device flipped
 * between portrait & landscape mode).
 * 
 * Add 'click' event listener to each menu link, passing event
 * handler function as callback to throttleEvent function with
 * 'interval' parameter of 300ms, thus limiting click events to
 * max 3 per second.
 * 
 * On click, after 300ms: close dropdown by passing it to
 * handleCloseNavDropdown function along with button 'active'
 * class; on smaller screens, (width <= 768px), main-menu will be
 * in dropdown mode, so get it along with its toggle button and
 * dropdown menu; set main menu 'open' class and pass it and menu
 * to handleCloseNestedDropdown function, remove 'open' class from
 * main menu dropdown and 'active' class from main menu toggle
 * button, thus closing entire main menu; pass main menu's toggle
 * button and 'open' class to handlePopupAria function.
 * 
 * @param {HTMLElement} dropdown - Element containing or consisting of navigation dropdown to be handled.
 */
 function handleDropdownMenu(dropdown) {
    const dropdownToggleButton = dropdown.querySelector('.menu-toggle-btn');
    const buttonActiveClass = 'menu-toggle-btn-active';
    const dropdownOpenClass = 'navbar-dropdown-open';
    const menuLinks = dropdown.querySelectorAll('.navbar-dropdown-item');

    handleDropdownAria(dropdownToggleButton, dropdownOpenClass);
    handlePopup(dropdownToggleButton, buttonActiveClass, dropdownOpenClass);

    window.addEventListener('resize', () => {
        const ddId = dropdownToggleButton.getAttribute('aria-controls');
        const dropdownMenu = dropdown.querySelector(`#${ddId}`);
        dropdownMenu.classList.remove(dropdownOpenClass);
        handleDropdownAria(dropdownToggleButton, dropdownOpenClass);
        dropdownToggleButton.classList.remove(buttonActiveClass);
    });

    if (menuLinks.length > 0) {
        for (let link of menuLinks) {
            link.addEventListener('click', throttleEvent(e => {
                // Only target link anchor element
                let targetLink = e.target.closest('a');
                if (!targetLink) return;

                setTimeout (() => {
                    if (window.innerWidth <= 768) {
                        const mainMenu = document.querySelector('#main-menu');
                        const mainMenuButton = mainMenu.querySelector('#main-menu-btn');
                        const mainMenuDropdown = mainMenu.querySelector('#main-menu-items');
                        const mainMenuOpenClass = 'main-menu-open';

                        handleCloseNestedDropdowns(mainMenu, buttonActiveClass);
                        mainMenuDropdown.classList.remove(mainMenuOpenClass);
                        mainMenuButton.classList.remove(buttonActiveClass);
                        handlePopupAria(mainMenuButton, mainMenuOpenClass);
                    } else {
                        handleCloseNavdDropdown(dropdown, buttonActiveClass);
                    }
                }, 300);
               // Pass 300ms time interval to throttleEvent function
            }, 300));
        }
    }
}

/**
 * Get passed-in parent element's nested navigation dropdown menus and
 * pass each one, along with passed-in toggle button 'active' class to
 * handler function.
 * 
 * @param {HTMLElement} parentMenu - Element containing navigation dropdowns to be handled.
 * @param {string} togglerActiveClass - Class name denoting toggle button active (popup visible).
 */
 function handleCloseNestedDropdowns(parentMenu, togglerActiveClass) {
    const dropdowns = parentMenu.querySelectorAll('.navbar-dropdown-menu-container');
    for (let dropdown of dropdowns) {
        handleCloseNavdDropdown(dropdown, togglerActiveClass);
    }
}

/**
 * Get passed-in navigation dropdown menu's toggle button and associated
 * menu list. Set 'active' class name for menu list.
 * 
 * Remove 'active' class name from menu list, effectively closing it.
 * Pass toggle button and its associated menu's 'active' class name to
 * handleDropdownAria function.
 * 
 * Remove passed-in 'active' class name from toggler button.
 * 
 * @param {HTMLElement} dropdown - Element containing or consisting of navigation dropdown to be handled.
 * @param {string} togglerActiveClass - Class name denoting toggle button active (popup visible).
 */
 function handleCloseNavdDropdown(dropdown, togglerActiveClass) {
    const ddToggleBtn = dropdown.querySelector('.menu-toggle-btn');
    const ddId = ddToggleBtn.getAttribute('aria-controls');
    const ddMenu = dropdown.querySelector(`#${ddId}`);
    const ddOpenClass = 'navbar-dropdown-open';
    ddMenu.classList.remove(ddOpenClass);
    handleDropdownAria(ddToggleBtn, ddOpenClass);
    ddToggleBtn.classList.remove(togglerActiveClass);
}

// --------------- Navigation dropdown functions end

// --------------------- Popups & dropdowns

// Aria properties

/**
 * Get passed-in toggle button's associated popup element. Get
 * popup's focusable child elements, exempting navigatiion dropdown
 * menu items as they have their own aria-handling function in order
 * to avoid aria-handling clashes between the main dropdown menu and
 * any navigation dropdowns nested within it.
 * 
 * Check popup for passed-in class name to determine if visible.
 * 
 * If popup hidden, set toggle button's aria-expanded attribute to
 * false, set popup's aria-hidden attribute to true and set each
 * focusable element's tabindex attribute to -1, thereby rendering 
 * them non-focusable.
 * 
 * If popup visible, set toggle button's aria-expanded attribute to
 * true, set popup's aria-hidden attribute to false and remove each
 * focusable elements' tabindex attributes so that they become
 * focusable again. Add one-time, 'focusout' event listener to
 * toggle button to set focus to specified element in popup, if any.
 * 
 * @param {HTMLElement} toggleButton - Button controlling popup element to be handled.
 * @param {string} popupOpenClass - Class name denoting popup element visible.
 */
function handlePopupAria (toggleButton, popupOpenClass) {
    const popupId = toggleButton.getAttribute('aria-controls');
    const popup = document.querySelector(`#${popupId}`);
    const elements = popup.querySelectorAll('a:not(.navbar-dropdown-item), audio, button, iframe, input');
    const focusElement = popup.querySelector('.first-focus');
    
    if (!popup.classList.contains(popupOpenClass)) {
        toggleButton.setAttribute('aria-expanded', 'false');
        popup.setAttribute('aria-hidden', 'true');
        for (let el of elements) {
            el.setAttribute('tabindex', '-1');
        }
    } else {
        toggleButton.setAttribute('aria-expanded', 'true');
        popup.setAttribute('aria-hidden', 'false');
        for (let el of elements) {
            el.removeAttribute('tabindex');
        }

        toggleButton.addEventListener('focusout', () => {
            if (focusElement) {
                focusElement.focus();
            }
        }, {once: true});
    }
}

/**
 * Get passed-in toggle button's associated dropdown element. Get
 * dropdown's focusable child elements.
 * 
 * Check dropdown for passed-in class name to determine if visible.
 * 
 * If dropdown hidden, set toggle button's aria-expanded attribute to
 * false, set dropdown's aria-hidden attribute to true and set each
 * focusable element's tabindex attribute to -1, thereby rendering 
 * them non-focusable.
 * 
 * If dropdown visible, set toggle button's aria-expanded attribute to
 * true, set dropdown's aria-hidden attribute to false and remove each
 * focusable elements' tabindex attributes so that they become
 * focusable again.
 * 
 * @param {HTMLElement} toggleButton - Button controlling dropdown element to be handled.
 * @param {string} dropdownOpenClass - Class name denoting dropdown element visible.
 */
function handleDropdownAria (toggleButton, dropdownOpenClass) {
    const dropdownId = toggleButton.getAttribute('aria-controls');
    const dropdown = document.querySelector(`#${dropdownId}`);
    const elements = dropdown.querySelectorAll('a, button, iframe, input');
    
    if (!dropdown.classList.contains(dropdownOpenClass)) {
        toggleButton.setAttribute('aria-expanded', 'false');
        dropdown.setAttribute('aria-hidden', 'true');
        for (let el of elements) {
            el.setAttribute('tabindex', '-1');
        }
    } else {
        toggleButton.setAttribute('aria-expanded', 'true');
        dropdown.setAttribute('aria-hidden', 'false');
        for (let el of elements) {
            el.removeAttribute('tabindex');
        }
    }
}

// Main functionality ('click' events)

/**
 * Get passed-in toggle button's associated popup element.
 * 
 * Add 'click' event listener to toggle button, passing event
 * handler function as callback to throttleEvent function with
 * 'interval' parameter of 300ms, thus limiting click events to
 * max 3 per second.
 * 
 * On click: toggle passed-in 'popup open' class on popup or, based
 * on popup type, add/remove appropriate class names and/or call
 * appropriate handler function(s); if appropriate, toggle
 * passed-in 'active' class on toggle button; pass toggle button
 * and 'popup open' class name to handlePopupAria function or, if 
 * popup is a navigation dropdown menu, to handleDropdownAria function.
 * 
 * If appropriate, pass toggle button and both class names to
 * handlePopupExternalEvent function.
 * 
 * @param {HTMLElement} toggleButton - Button controlling popup element to be handled.
 * @param {string} togglerActiveClass - Class name denoting toggle button active (popup visible).
 * @param {string} popupOpenClass - Class name denoting popup element visible.
 */
function handlePopup(toggleButton, togglerActiveClass, popupOpenClass) {
    const popupId = toggleButton.getAttribute('aria-controls');
    const popup = document.querySelector(`#${popupId}`);

    toggleButton.addEventListener('click', throttleEvent(e => {
        // Only target entire button element
        let targetButton = e.target.closest('button');
        if (!targetButton) return;

        /* Specific handling of news & events page article
           dropdowns */
        if (popup.classList.contains('news-item-main') || popup.classList.contains('gig-listing-main')) {
            if (popup.classList.contains(popupOpenClass)) {
                handleCollapseArticle(toggleButton, togglerActiveClass, popupOpenClass);
            } else {
                popup.classList.add(popupOpenClass);
                toggleButton.classList.add(togglerActiveClass);
            }
        /* Specific handling of main menu's nested navigation
           dropdown menus when it's in dropdown mode itself */
        } else if (popup.classList.contains('main-menu-responsive') && popup.classList.contains(popupOpenClass)) {
            handleCloseNestedDropdowns(popup, togglerActiveClass);
            popup.classList.remove(popupOpenClass);
            toggleButton.classList.remove(togglerActiveClass);
        // Handling of generic popups
        } else {
            popup.classList.toggle(popupOpenClass);
            toggleButton.classList.toggle(togglerActiveClass);
        }

        // Handling of aria properties
        if (popup.classList.contains('navbar-dropdown-menu')) {
            handleDropdownAria(toggleButton, popupOpenClass);
        } else {            
            handlePopupAria(toggleButton, popupOpenClass);
        }

        /* Exempt navigation dropdown menus from being passed to 
           external event handler if main menu is in dropdown mode - 
           will be handled along with main menu. Exempt news & events
           page articles from closing on external events in all cases. */
        if (window.innerWidth <= 768) {
            if (!(toggleButton.classList.contains('navbar-dropdown-btn') || toggleButton.classList.contains('article-toggle-btn'))) {
                handlePopupExternalEvent(toggleButton, togglerActiveClass, popupOpenClass);
            }
        } else {
            if (!(toggleButton.classList.contains('article-toggle-btn'))) {
                handlePopupExternalEvent(toggleButton, togglerActiveClass, popupOpenClass);
            }
        }
    // Pass 300ms time interval to throttleEvent function
    }, 300));
}

// External events

/**
 * Get passed-in toggle button's associated popup element.
 * 
 * Check popup for passed-in class name to determine if visible.
 * 
 * If popup visible, add event listeners to window object for click,
 * touch and focus events outside popup and toggle button. If
 * detected: hide popup; pass toggle button and 'popup open' class
 * name to handlePopupAria function or, if popup is a navigation 
 * dropdown menu, to handleDropdownAria function; remove 'active' 
 * class from toggle button.
 * 
 * If main menu is in dropdown mode, (screen <= 768px), navigation
 * dropdown menus won't have been passed in here, (see handlePopup
 * function), so they are dealt with along with the main menu (i.e.
 * passed to handleCloseNestedDropdowns function).
 * 
 * Remove event listeners from window. If appropriate, set focus to
 * toggle button.
 * 
 * @param {HTMLElement} toggleButton - Button controlling popup element to be handled.
 * @param {string} togglerActiveClass - Class name denoting toggle button active (popup visible).
 * @param {string} popupOpenClass - Class name denoting popup element visible.
 */
function handlePopupExternalEvent(toggleButton, togglerActiveClass, popupOpenClass) {
    const popupId = toggleButton.getAttribute('aria-controls');
    const popup = document.querySelector(`#${popupId}`);
    // Boolean variable to indicate keyboard tab key navigation
    let tabKeyNavigation = false;

    // Handler function for event listeners
    const close = e => {
        if (!popup.contains(e.target) && !toggleButton.contains(e.target)) {

            if (popup.classList.contains('main-menu-responsive')) {
                handleCloseNestedDropdowns(popup, togglerActiveClass);
            }

            popup.classList.remove(popupOpenClass);

            if (popup.classList.contains('navbar-dropdown-menu')) {
                handleDropdownAria(toggleButton, popupOpenClass);
            } else {            
                handlePopupAria(toggleButton, popupOpenClass);
            }

            toggleButton.classList.remove(togglerActiveClass);
        } else return;
        
        window.removeEventListener('click', close);
        window.removeEventListener('touchstart', close);
        window.removeEventListener('focusin', close);
        window.removeEventListener('keydown', detectTabbing);

        if (tabKeyNavigation) {
            toggleButton.focus();
        }
    }

    // Event listeners
    if (popup.classList.contains(popupOpenClass)) {
        window.addEventListener('click', close);
        /* Needed for iOS Safari as click events won't bubble up to
           window object */
        window.addEventListener('touchstart', close);
        // Needed for keyboard navigation (tabbing out of popup)
        window.addEventListener('focusin', close);
        /* Listener to detect tab key navigation & set value of
           boolean variable */
        window.addEventListener('keydown', detectTabbing = e => {
            if (e.key === 'Tab' || ((e.keyCode || e.which) === 9)) {
                let tab = true;

                if (tab || (e.shiftKey && tab)) {
                    tabKeyNavigation = true;
                }
            } else {
                tabKeyNavigation = false;
            }
        });
    }
}

// --------------- Popups & dropdowns functions end

// ---------------- Collapsible sections handlers

/**
 * Get passed-in section's collapsible elements, their controlling
 * button and the button text to change with button state.
 * 
 * Add 'click' event listener to button. On click, add/remove
 * classes and set aria-attributes to elements and button as
 * appropriate, based on button state.
 * 
 * @param {HTMLElement} section - Section element containing collapsible elements and collapse/expand button
 */
function handleCollapseSection(section) {
    const collapsibleEls = section.querySelectorAll('.collapsible');
    const collapseBtn = section.querySelector('.more-btn');
    const btnText = collapseBtn.querySelector('span');

    collapseBtn.addEventListener('click', (e) => {
        // Only target entire button element
        let targetButton = e.target.closest('button');
        if (!targetButton) return;

        if (collapseBtn.classList.contains('show-more')) {
            for (let el of collapsibleEls) {
                el.classList.add('expanded');
                el.classList.remove('collapsed');
                el.setAttribute('aria-hidden', 'false');
            }
            collapseBtn.classList.remove('show-more');
            collapseBtn.classList.add('show-less');
            btnText.innerHTML = 'less';
            collapseBtn.setAttribute('aria-expanded', 'true');
        } else if (collapseBtn.classList.contains('show-less')) {
            for (let el of collapsibleEls) {
                el.classList.add('collapsed');
                el.classList.remove('expanded');
                el.setAttribute('aria-hidden', 'true');
            }
            collapseBtn.classList.remove('show-less');
            collapseBtn.classList.add('show-more');
            btnText.innerHTML = 'more';
            collapseBtn.setAttribute('aria-expanded', 'false');
        }
    });
}

// --------------- Collapsible sections handlers end

// -------------------- Landing page handlers

/**
 * Get header logo conatiner element from DOM. Get logo image anchor
 * element, logo image, logo text and logo text line break.
 * 
 * Add 'scroll' event listener to window. On scroll, get passed-in
 * 'control' element's top and height properties. Calculate point at
 * which logo display is to change, based on 'control' element's
 * scrollY position. Apply appropriate display/hide classes and aria
 * attributes to logo elements as scrollY reaches/passes change point.
 * 
 * @param {HTMLElement} controlElement - Element on page whose scroll position determines how header logo is displayed.
 */
function handleHeaderLogoDisplay(controlElement) {
    const headerLogo = document.querySelector('#header-logo');
    const logoImgLink = headerLogo.querySelector('.header-img-link');
    const logoImg = logoImgLink.querySelector('img');
    const logoTxt = headerLogo.querySelector('h1');
    const logoBreak = logoTxt.querySelector('br');
    let changePoint;

    window.addEventListener('scroll', () => {
        /* Get control element's scroll position relative to window as
           opposed to parent, which 'offsetTop' does */
        const sectionTop = controlElement.getBoundingClientRect().top;
        const sectionHeight = controlElement.getBoundingClientRect().height;

        if (controlElement.id === 'landing-banner-img') {
            /* logo on banner image takes up 63.33% of image height,
               so point at which header logo image is displayed set 
               to point at which banner image almost hidden */
            changePoint = (sectionHeight * (63.33 / 100)) - (sectionHeight / 10);
        } else changePoint = sectionTop - (sectionHeight / 3);

        if (scrollY >= changePoint) {
            logoImgLink.removeAttribute('tabindex');
            logoImgLink.removeAttribute('aria-hidden');
            logoImg.classList.add('logo-size');
            logoImg.classList.remove('shrink-hide');
            logoTxt.classList.add('logo-txt-std');
            logoTxt.classList.remove('logo-txt-solo');
            logoBreak.classList.add('logo-txt-br');
            logoBreak.classList.remove('logo-txt-br-solo');
        } else {
            logoBreak.classList.add('logo-txt-br-solo');
            logoBreak.classList.remove('logo-txt-br');
            logoTxt.classList.add('logo-txt-solo');
            logoTxt.classList.remove('logo-txt-std');
            logoImg.classList.add('shrink-hide');
            logoImg.classList.remove('logo-size');
            logoImgLink.setAttribute('tabindex', '-1');
            logoImgLink.setAttribute('aria-hidden', 'true');
        }
    });
}

// ----------------- Landing page handlers end

// -------------- Bootstrap components custom handlers

// ------------------------- Accordions

// /**
//  * Get passed-in Bootstrap 'accordion' component's child 'card'
//  * components, each of which in turn contains a Bootstrap 'collapse'
//  * component in the card body and its associated control link in the
//  * card header.
//  * 
//  * Get each card's empty, block-level anchor tag which contains its
//  * CSS 'scroll-margin-top' property and hence controls its position
//  * below the page's fixed header.
//  * 
//  * Get each card's header and 'collapse' component's controlling
//  * link.
//  * 
//  * Add 'click' event listener to each controlling link. (Used
//  * instead of Bootstrap 'show.bs.collapse' or 'hide.bs.collapse'
//  * events in case they don't fire in time.)
//  * 
//  * On click, wait 0.5 seconds (setTimeout()) for 'collapse' component
//  * to expand. If the card header has passed the bottom of the page's
//  * fixed header, set the window target to the card's empty anchor tag
//  * so that the card header scrolls back to the bottom of the page
//  * header.
//  * 
//  * @param {HTMLElement} accordion - Bootstrap 'accordion' component element.
//  */
// function handleBootstrapAccordionPageBreach(accordion) {
//     const cards = accordion.querySelectorAll('.card');

//     if (cards.length > 0) {
//         for (let card of cards) {
//             const anchor = card.querySelector('.card-anchor');
//             const header = card.querySelector('.card-header');
//             const collapseLink = header.querySelector('.faq-accordion-link');

//             collapseLink.addEventListener('click', () => {
//                 setTimeout(() => {
//                     // On smaller screens (width <= 768px), page header is 140px high
//                     if (window.innerWidth <= 768) {
//                         if (header.getBoundingClientRect().top < 140) {
//                             window.location.href = `#${anchor.id}`;                                
//                         }
//                     // On larger screens, page header is 207px high
//                     } else {
//                         if (header.getBoundingClientRect().top < 207) {
//                             window.location.href = `#${anchor.id}`;                                
//                         }
//                     }
//                 }, 500);
//             });
//         }
//     }
// }

// ----------- Bootstrap components custom handlers end

// ------------------- Contact Forms & EmailJS

/**
 * Get passed-in form element's child 'success' and 'failure' message
 * div elements and submit button's container div element. Get form
 * element's parent 'modal' element, if any.
 * 
 * Add 'submit' event listener to passed-in form element.
 * 
 * On submit, set template parameters object to be passed to EmailJS
 * send() method with keys matching EmailJS template variable names
 * and values populated from corresponding field in form element.
 * 
 * Call send() method to submit form details to EmailJS, passing in
 * EmailJS service ID, EmailJS template ID and template parameters
 * object, then await response. On 'success' response, display
 * 'success' message and hide submit button. On 'error' response,
 * display 'failure' message and hide submit button. Change each
 * element's 'aria-hidden' attribute accordingly and disable any
 * focusable elements that are hidden. If parent 'modal' exists,
 * pass to trapKeyNavFocus() function to update list of focusable
 * elements.
 * 
 * @param {HTMLElement} contactForm - Contact form from 'Contact Us' page or footer email modal: form element.
 */
function handleContactFormEmailJS(contactForm) {
    const successMsg = contactForm.querySelector('.cf-success-message');
    const failureMsg = contactForm.querySelector('.cf-failure-message');
    const submitBtnSection = contactForm.querySelector('.contact-btn-wrapper');
    const modal = contactForm.closest('.modal');

    contactForm.addEventListener('submit', (e) => {
        // Prevent page from refreshing on form submit
        e.preventDefault();
        // get Google reCAPTCHA response token
        let captchaToken = grecaptcha.enterprise.getResponse();
        // Set parameters to be sent to EmailJS template
        // **Key values MUST match variable names in EmailJS template
        let templateParams = {
            'first_name': contactForm.firstname.value,
            'last_name': contactForm.surname.value,
            'email_addr': contactForm.email.value,
            'phone_no': contactForm.phone.value,
            'message': contactForm.message.value,
            "g-recaptcha-response": captchaToken,
        }
        // Call EmailJS send() method to submit form
        emailjs.send('gmail_HWD', 'contact-form', templateParams).then(
            (response) => {
                console.log('SUCCESS!', response.status, response.text);
                submitBtnSection.classList.add('shrink-hide');
                submitBtnSection.setAttribute('aria-hidden', 'true');
                submitBtnSection.querySelector('button').setAttribute('disabled', ''); // hidden submit button
                submitBtnSection.querySelector('textarea').setAttribute('disabled', ''); // hidden Google reCAPTCHA
                contactForm.querySelector('.failure-email-link').setAttribute('disabled', ''); // hidden link in failure message
                successMsg.classList.remove('cf-hidden');
                successMsg.setAttribute('aria-hidden', 'false');
                // resubmit modal, if any, to trapKeyNavFocus() function
                if (modal) trapKeyNavFocus(modal);
            },
            (error) => {
                console.log('FAILED...', error);
                submitBtnSection.classList.add('shrink-hide');
                submitBtnSection.setAttribute('aria-hidden', 'true');
                submitBtnSection.querySelector('button').setAttribute('disabled', ''); // hidden submit button
                submitBtnSection.querySelector('textarea').setAttribute('disabled', ''); // hidden Google reCAPTCHA
                failureMsg.classList.remove('cf-hidden');
                failureMsg.setAttribute('aria-hidden', 'false');
                // resubmit modal, if any, to trapKeyNavFocus() function
                if (modal) trapKeyNavFocus(modal);
            },
        );
    });
}

/**
 * Get form to which passed-in Google reCAPTCHA has been applied and
 * 'div' element (captchaDiv) containing reCAPTCHA iframe, if loaded in.
 * 
 * Get width of form and if less than 304px, add 'transform: scale'
 * style to reCAPTCHA using ratio of captchaDiv to reCAPTCHA's parent
 * element. If width of form greater than 304px, remove style.
 * 
 * @param {HTMLElement} captcha - Div element into which Google reCAPTCHA is dynamically loaded. 
 */
function resizeCaptcha(captcha) {
    const parentForm = captcha.closest('form');
    const captchaDiv = captcha.children[0];

    if (captchaDiv) {
        if (parentForm.getBoundingClientRect().width <= 304) {
        const captchaWidth = captchaDiv.getBoundingClientRect().width;
        const parentWidth = captcha.parentElement.getBoundingClientRect().width;
            captcha.style.transform = `scale(${parentWidth / captchaWidth})`;
        } else {
            captcha.removeAttribute('style');
        }
    }
}

// ------------- Contact Forms & EmailJS functions end

// ------------------- Miscellaneous functions

// Trapping focus inside elements for keyboard navigation accessibility (e.g. modals)

/**
 * Get all focusable elements within passed in element and find
 * the first and last.
 * 
 * Listen for 'tab' or 'shift + tab' keypresses to signify keyboard
 * navigation and if the active element is first in the list on 
 * 'shift + tab' (backwards navigation), set focus to the first (and
 * vice-versa).
 *  
 * @param {HTMLElement} element - Element (modal, etc) in which focus is to be trapped
 */
function trapKeyNavFocus(element) {
    const focusableEls = element.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])');
    const firstFocusableEl = focusableEls[0];  
    const lastFocusableEl = focusableEls[focusableEls.length - 1];
  
    element.addEventListener('keydown', (e) => {
        let isTabPressed = (e.key === 'Tab');
    
        if (!isTabPressed) { 
            return; 
        }
    
        if ( e.shiftKey ) {
        // Shift + Tab
            if (document.activeElement === firstFocusableEl) {
                lastFocusableEl.focus();
                e.preventDefault();
            }
        } else {
        // Tab
            if (document.activeElement === lastFocusableEl) {
                firstFocusableEl.focus();
                e.preventDefault();
            }
        }
    });
}

// Applying 'active' class to navigation links when associated page section in view

/**
 * Find link element in passed-in navigation link node list that has
 * the passed-in 'active' class, if any, and set as default 'active'
 * link.
 * 
 * Add 'scroll' event listener to window. On scroll event:
 * 
 * For each section element in passed-in section elements node list,
 * get its height and its offsetTop property (distance in pixels from
 * top of element to top of closest offset parent element, in this
 * case 'body');
 * 
 * When scrolled window's Y coordinate + height of fixed page header
 * is greater than or equal to section element's offsetTop - 1/3 of
 * section element's height, (i.e. 1/3 of section visible below header),
 * set section element's id attribute as 'current' section id;
 * 
 * Remove 'active' class from each navigation link, check its href
 * attribute for the 'current' section id (i.e  whether or not it
 * links to 'current' section) and set as 'active' link if matching.
 * If no 'current' section id (undefined), set default 'active' link
 * as 'active link;
 * 
 * Add 'active' class to 'active' link. 
 * 
 * @param {NodeList} navLinkEls - Navigation link elements that could potentially be subject to style change on scroll event.
 * @param {NodeList} LinkedSectionEls - Section elements associated with navigation links.
 * @param {string} activeClass - Class name that applies CSS styles to link elements deemed 'active'.
 */
function handleActiveLinkStyleOnScroll(navLinkEls, linkedSectionEls, activeClass) {
    let defaultActiveLink;

    for (let link of navLinkEls) {
        if (link.classList.contains(activeClass)) {
            defaultActiveLink = link;
        }
    }

    window.addEventListener('scroll', () => {
        let currentSectionId;
        let activeLink;

        for (let linkedSection of linkedSectionEls) {
            const sectionTop = linkedSection.offsetTop;
            const sectionHeight = linkedSection.clientHeight;
            // On smaller screens (width <= 768px), page header is 140px high
            if (window.innerWidth <= 768) {   
                if ((scrollY + 140) >= (sectionTop - (sectionHeight / 3))) {
                    currentSectionId = linkedSection.id
                }
            // On larger screens, page header is 207px high
            } else {
                if ((scrollY + 207) >= (sectionTop - (sectionHeight / 3))) {
                    currentSectionId = linkedSection.id
                }
            }
            
        }

        for (let link of navLinkEls) {
            if (link.classList.contains(activeClass)) {
                link.classList.remove(activeClass);
            }
            
            if (link.href.includes(`#${currentSectionId}`)) {
                activeLink = link;
            } else if (!currentSectionId){
                activeLink = defaultActiveLink;
            }
        }

        activeLink.classList.add(activeClass);
    });

}

// Throttling

/**
 * When called on an event listener's handler function, returns a
 * new event listener after a passed-in time interval, thus
 * preventing further events from firing until interval has elapsed.
 * 
 * @param {function} handler - Event handler function to be throttled.
 * @param {number} interval - Time allowed in ms between events firing. 
 * @returns {function} throttledFunction - Handler function with throttling interval applied.
 */
 function throttleEvent(handler, interval) {
    /* Boolean to control when time interval has passed.
       Set to true so that handler can be called first time. */
    let enableEvent = true;

    /* Nested function to preserve throttleEvent function's 'this'
       (execution) context and apply it to passed-in handler
       (callback) function.
       Uses rest parameter syntax (...) to pack handler's arguments
       into an array which can be read by 'apply' method. */
    return function throttledFunction(...args) {
        /* If time interval not up, exit function without calling
           handler */
        if (!enableEvent) return;
        // Prevent handler being called until interval has passed
        enableEvent = false;
        /* Apply throttling to handler and return throttled version
           with any arguments */
        handler.apply(this, args);
        // Set control flag to true after passed-in interval
        setTimeout(() => enableEvent = true, interval);
    }
}

// ----------------- Miscellaneous functions end
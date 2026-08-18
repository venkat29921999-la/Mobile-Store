/* =========================================================
   STACKLY — dashboard.js
   USER + ADMIN DASHBOARD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  /* =========================================================
     1. USER INFORMATION
     ========================================================= */

  function createNameFromEmail(email) {

    if (!email) {
      return "User";
    }

    const localPart = String(email)
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/[0-9]+/g, " ")
      .trim();

    if (!localPart) {
      return "User";
    }

    return localPart
      .split(/\s+/)
      .filter(Boolean)
      .map(function (word) {
        return (
          word.charAt(0).toUpperCase() +
          word.slice(1)
        );
      })
      .join(" ");
  }


  function getInitials(name) {

    if (!name) {
      return "U";
    }

    const words = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  }


  function getCurrentUser() {

    try {

      const savedUser =
        localStorage.getItem(
          "stacklyCurrentUser"
        );

      if (savedUser) {

        const parsed =
          JSON.parse(savedUser);

        if (
          parsed &&
          typeof parsed === "object"
        ) {

          const email =
            parsed.email || "";

          const name =
            parsed.name ||
            createNameFromEmail(email);

          return {
            name: name,
            email: email,
            role:
              parsed.role ||
              "customer"
          };
        }
      }

    } catch (error) {

      console.warn(
        "STACKLY: Unable to read current user.",
        error
      );

    }


    const email =
      localStorage.getItem(
        "stacklyUserEmail"
      ) || "";


    const savedName =
      localStorage.getItem(
        "stacklyUserName"
      ) || "";


    const role =
      localStorage.getItem(
        "stacklyUserRole"
      ) || "customer";


    return {

      name:
        savedName ||
        createNameFromEmail(email),

      email: email,

      role: role

    };
  }


  function updateDashboardUser() {

    const user =
      getCurrentUser();


    const name =
      user.name ||
      createNameFromEmail(
        user.email
      );


    const initials =
      getInitials(name);


    /* Sidebar name */

    document
      .querySelectorAll(
        ".db-user-card-info strong"
      )
      .forEach(function (element) {

        element.textContent =
          name;

      });


    /* Sidebar avatar */

    document
      .querySelectorAll(
        ".db-sidebar .db-user-card .db-avatar"
      )
      .forEach(function (element) {

        element.textContent =
          initials;

      });


    /* Top profile name */

    document
      .querySelectorAll(
        ".db-profile-name"
      )
      .forEach(function (element) {

        element.textContent =
          name;

      });


    /* Top profile avatar */

    document
      .querySelectorAll(
        ".db-profile-btn .db-avatar"
      )
      .forEach(function (element) {

        element.textContent =
          initials;

      });


    /* Welcome message */

    document
      .querySelectorAll(
        ".db-banner-text h1"
      )
      .forEach(function (element) {

        const wave =
          element.querySelector(
            ".wave"
          );


        element.textContent =
          "Welcome back, " +
          name +
          " ";


        if (wave) {

          element.appendChild(
            wave
          );

        } else {

          const newWave =
            document.createElement(
              "span"
            );

          newWave.className =
            "wave";

          newWave.textContent =
            "👋";

          element.appendChild(
            newWave
          );
        }

      });


    document.body.dataset.userName =
      name;


    document.body.dataset.userEmail =
      user.email || "";


    document.body.dataset.userRole =
      user.role || "";


    window.STACKLY_CURRENT_USER = {

      name: name,

      email:
        user.email || "",

      role:
        user.role || ""

    };

  }


  updateDashboardUser();


  /* =========================================================
     2. MOBILE SIDEBAR
     ========================================================= */

  const sidebar =
    document.getElementById(
      "dbSidebar"
    );


  const hamburger =
    document.getElementById(
      "dbHamburger"
    );


  const sidebarClose =
    document.getElementById(
      "dbSidebarClose"
    );


  const overlay =
    document.getElementById(
      "dbOverlay"
    );


  function setSidebar(open) {

    if (!sidebar) {
      return;
    }


    sidebar.classList.toggle(
      "open",
      open
    );


    if (hamburger) {

      hamburger.classList.toggle(
        "active",
        open
      );

    }


    if (overlay) {

      overlay.classList.toggle(
        "show",
        open
      );

    }


    if (
      window.matchMedia(
        "(max-width: 980px)"
      ).matches
    ) {

      document.body.style.overflow =
        open
          ? "hidden"
          : "";

    } else {

      document.body.style.overflow =
        "";

    }
  }


  if (hamburger) {

    hamburger.addEventListener(
      "click",
      function () {

        const open =
          sidebar &&
          sidebar.classList.contains(
            "open"
          );

        setSidebar(!open);

      }
    );

  }


  if (sidebarClose) {

    sidebarClose.addEventListener(
      "click",
      function () {

        setSidebar(false);

      }
    );

  }


  if (overlay) {

    overlay.addEventListener(
      "click",
      function () {

        setSidebar(false);

      }
    );

  }


  window.addEventListener(
    "resize",
    function () {

      if (
        window.matchMedia(
          "(min-width: 981px)"
        ).matches
      ) {

        setSidebar(false);

      }

    }
  );


  /* =========================================================
     3. PROFILE DROPDOWN
     ========================================================= */

  function setupDropdown(
    buttonId,
    containerId
  ) {

    const button =
      document.getElementById(
        buttonId
      );


    const container =
      document.getElementById(
        containerId
      );


    if (
      !button ||
      !container
    ) {
      return;
    }


    button.addEventListener(
      "click",
      function (event) {

        event.stopPropagation();


        const shouldOpen =
          !container.classList.contains(
            "open"
          );


        document
          .querySelectorAll(
            ".db-profile.open, .db-notif.open"
          )
          .forEach(function (element) {

            element.classList.remove(
              "open"
            );

          });


        container.classList.toggle(
          "open",
          shouldOpen
        );

      }
    );

  }


  setupDropdown(
    "dbProfileBtn",
    "dbProfile"
  );


  /*
     Notification button.

     If you added:
     onclick="window.location.href='404.html'"
     then don't override it.
  */

  const notificationButton =
    document.getElementById(
      "dbNotifBtn"
    );


  if (
    notificationButton &&
    !notificationButton.hasAttribute(
      "onclick"
    )
  ) {

    setupDropdown(
      "dbNotifBtn",
      "dbNotif"
    );

  }


  document.addEventListener(
    "click",
    function () {

      document
        .querySelectorAll(
          ".db-profile.open, .db-notif.open"
        )
        .forEach(function (element) {

          element.classList.remove(
            "open"
          );

        });

    }
  );


  /* =========================================================
     4. INLINE DASHBOARD NAVIGATION
     ========================================================= */

  const navLinks =
    document.querySelectorAll(
      ".db-nav-link"
    );


  function normalizeView(value) {

    if (!value) {
      return "";
    }


    let view =
      String(value)
        .trim()
        .toLowerCase();


    view =
      view
        .replace(/^#/, "")
        .replace(/^dbview/, "")
        .replace(/^db-view-/, "")
        .replace(/^view-/, "");


    if (
      view.includes("overview") ||
      view === "home"
    ) {
      return "overview";
    }


    if (
      view.includes("order")
    ) {
      return "orders";
    }


    if (
      view.includes("wishlist") ||
      view.includes("wish")
    ) {
      return "wishlist";
    }


    if (
      view.includes("message") ||
      view.includes("inbox") ||
      view.includes("support")
    ) {
      return "messages";
    }


    if (
      view.includes("reward")
    ) {
      return "rewards";
    }


    if (
      view.includes("setting")
    ) {
      return "settings";
    }


    if (
      view.includes("product")
    ) {
      return "products";
    }


    if (
      view.includes("customer")
    ) {
      return "customers";
    }


    if (
      view.includes("analytic")
    ) {
      return "analytics";
    }


    return view;
  }


  function getNavView(link) {

    if (!link) {
      return "";
    }


    if (
      link.dataset &&
      link.dataset.view
    ) {

      return normalizeView(
        link.dataset.view
      );

    }


    if (
      link.dataset &&
      link.dataset.target
    ) {

      return normalizeView(
        link.dataset.target
      );

    }


    const href =
      link.getAttribute(
        "href"
      );


    if (
      href &&
      href.startsWith("#") &&
      href !== "#"
    ) {

      return normalizeView(
        href
      );

    }


    return normalizeView(
      link.textContent
    );

  }


  function findPanel(view) {

    view =
      normalizeView(view);


    if (!view) {
      return null;
    }


    const first =
      view.charAt(0).toUpperCase();


    const rest =
      view.slice(1);


    const ids = [

      "dbView" +
      first +
      rest,

      "db-view-" +
      view,

      "dbView-" +
      view

    ];


    for (
      let i = 0;
      i < ids.length;
      i++
    ) {

      const panel =
        document.getElementById(
          ids[i]
        );


      if (panel) {
        return panel;
      }

    }


    const dataPanel =
      document.querySelector(
        '[data-view-section="' +
        view +
        '"]'
      );


    if (dataPanel) {
      return dataPanel;
    }


    /*
       Messages can also use
       dbInboxPanel.
    */

    if (
      view === "messages"
    ) {

      const inbox =
        document.getElementById(
          "dbInboxPanel"
        );


      if (inbox) {
        return inbox;
      }

    }


    return null;
  }


  function showView(
    view,
    updateHash
  ) {

    view =
      normalizeView(view);


    if (!view) {
      return false;
    }


    const panel =
      findPanel(view);


    /*
       IMPORTANT:
       If the panel does not exist,
       do not pretend navigation worked.
    */

    if (!panel) {

      console.warn(
        "STACKLY: Missing dashboard section:",
        view
      );

      return false;
    }


    /*
       Hide all inline sections.
    */

    document
      .querySelectorAll(
        "[data-view-section], .db-view-panel"
      )
      .forEach(function (element) {

        element.classList.remove(
          "active",
          "is-active"
        );


        element.setAttribute(
          "aria-hidden",
          "true"
        );

      });


    /*
       Show selected section.
    */

    panel.classList.add(
      "active",
      "is-active"
    );


    panel.setAttribute(
      "aria-hidden",
      "false"
    );


    /*
       Active sidebar link.
    */

    navLinks.forEach(
      function (link) {

        const linkView =
          getNavView(link);


        link.classList.toggle(
          "active",
          linkView === view
        );

      }
    );


    /*
       Update hash.
    */

    if (
      updateHash !== false
    ) {

      const hash =
        "#" + view;


      if (
        window.location.hash !==
        hash
      ) {

        history.replaceState(
          null,
          "",
          hash
        );

      }

    }


    /*
       Close mobile sidebar.
    */

    setSidebar(false);


    /*
       Scroll top.
    */

    const main =
      document.querySelector(
        ".db-main"
      );


    if (main) {

      main.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });


    /*
       Reveal elements.
    */

    panel
      .querySelectorAll(
        "[data-db-reveal]"
      )
      .forEach(function (element) {

        element.classList.add(
          "in-view"
        );

      });


    return true;
  }


  /* =========================================================
     5. NAVIGATION CLICK
     ========================================================= */

  navLinks.forEach(
    function (link) {

      link.addEventListener(
        "click",
        function (event) {

          const view =
            getNavView(link);


          const dashboardViews = [

            "overview",
            "orders",
            "wishlist",
            "messages",
            "rewards",
            "settings",
            "products",
            "customers",
            "analytics"

          ];


          if (
            dashboardViews.includes(
              view
            )
          ) {

            /*
               Stop normal href navigation.
            */

            event.preventDefault();


            /*
               Open inline section.
            */

            showView(
              view,
              true
            );

          }

        }
      );


      /*
         Keyboard accessibility.
      */

      link.addEventListener(
        "keydown",
        function (event) {

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {

            const view =
              getNavView(link);


            if (view) {

              event.preventDefault();


              showView(
                view,
                true
              );

            }

          }

        }
      );

    }
  );


  /* =========================================================
     6. HASH NAVIGATION
     ========================================================= */

  function loadHash() {

    let hash =
      window.location.hash
        .replace("#", "")
        .trim();


    /*
       Default to overview.
    */

    if (!hash) {

      const overview =
        findPanel(
          "overview"
        );


      if (overview) {

        showView(
          "overview",
          false
        );

      }

      return;
    }


    const view =
      normalizeView(hash);


    if (
      findPanel(view)
    ) {

      showView(
        view,
        false
      );

    } else {

      /*
         Invalid hash -> overview.
      */

      const overview =
        findPanel(
          "overview"
        );


      if (overview) {

        showView(
          "overview",
          false
        );

      }

    }

  }


  window.addEventListener(
    "hashchange",
    function () {

      loadHash();

    }
  );


  loadHash();


  /* =========================================================
     7. RECENT ORDERS — VIEW ALL
     ========================================================= */

  document
    .querySelectorAll(
      ".db-panel-link"
    )
    .forEach(
      function (link) {

        const text =
          link.textContent
            .trim()
            .toLowerCase();


        if (
          text.includes(
            "view all"
          )
        ) {

          link.addEventListener(
            "click",
            function (event) {

              const orders =
                findPanel(
                  "orders"
                );


              if (orders) {

                event.preventDefault();


                showView(
                  "orders",
                  true
                );

              }

            }
          );

        }

      }
    );


  /* =========================================================
     8. TRACK AN ORDER
     ========================================================= */

  document
    .querySelectorAll(
      ".db-banner-cta"
    )
    .forEach(
      function (button) {

        button.addEventListener(
          "click",
          function (event) {

            const orders =
              findPanel(
                "orders"
              );


            const href =
              button.getAttribute(
                "href"
              );


            if (
              orders &&
              (
                !href ||
                href === "404.html"
              )
            ) {

              event.preventDefault();


              showView(
                "orders",
                true
              );

            }

          }
        );

      }
    );


  /* =========================================================
     9. COUNT-UP NUMBERS
     ========================================================= */

  const statElements =
    document.querySelectorAll(
      ".db-stat-num[data-count]"
    );


  function animateNumber(
    element
  ) {

    if (
      element.dataset.animated ===
      "true"
    ) {
      return;
    }


    element.dataset.animated =
      "true";


    const target =
      parseFloat(
        element.dataset.count
      ) || 0;


    const duration =
      1000;


    const start =
      performance.now();


    function update(now) {

      const progress =
        Math.min(
          (now - start) /
          duration,
          1
        );


      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );


      const value =
        target * eased;


      element.textContent =
        Math.round(
          value
        ).toLocaleString();


      if (
        progress < 1
      ) {

        requestAnimationFrame(
          update
        );

      }

    }


    requestAnimationFrame(
      update
    );

  }


  if (
    "IntersectionObserver" in window
  ) {

    const observer =
      new IntersectionObserver(
        function (entries) {

          entries.forEach(
            function (entry) {

              if (
                entry.isIntersecting
              ) {

                animateNumber(
                  entry.target
                );


                observer.unobserve(
                  entry.target
                );

              }

            }
          );

        },
        {
          threshold: 0.3
        }
      );


    statElements.forEach(
      function (element) {

        observer.observe(
          element
        );

      }
    );

  } else {

    statElements.forEach(
      function (element) {

        animateNumber(
          element
        );

      }
    );

  }


  /* =========================================================
     10. REWARD RING
     ========================================================= */

  const ring =
    document.querySelector(
      ".db-ring-fill[data-pct]"
    );


  if (ring) {

    const percentage =
      parseFloat(
        ring.dataset.pct
      ) || 0;


    const circumference =
      251;


    function showRing() {

      ring.style.strokeDashoffset =
        String(
          circumference *
          (
            1 -
            percentage / 100
          )
        );

    }


    if (
      "IntersectionObserver" in window
    ) {

      const ringObserver =
        new IntersectionObserver(
          function (entries) {

            entries.forEach(
              function (entry) {

                if (
                  entry.isIntersecting
                ) {

                  showRing();


                  ringObserver.unobserve(
                    entry.target
                  );

                }

              }
            );

          },
          {
            threshold: 0.3
          }
        );


      ringObserver.observe(
        ring
      );

    } else {

      showRing();

    }

  }


  /* =========================================================
     11. BAR CHART
     ========================================================= */

  const chart =
    document.querySelector(
      ".db-chart"
    );


  if (chart) {

    const bars =
      chart.querySelectorAll(
        ".db-chart-bar[data-height]"
      );


    function animateBars() {

      bars.forEach(
        function (bar, index) {

          setTimeout(
            function () {

              bar.style.height =
                bar.dataset.height +
                "%";

            },
            index * 80
          );

        }
      );

    }


    if (
      "IntersectionObserver" in window
    ) {

      const chartObserver =
        new IntersectionObserver(
          function (entries) {

            entries.forEach(
              function (entry) {

                if (
                  entry.isIntersecting
                ) {

                  animateBars();


                  chartObserver.unobserve(
                    entry.target
                  );

                }

              }
            );

          },
          {
            threshold: 0.3
          }
        );


      chartObserver.observe(
        chart
      );

    } else {

      animateBars();

    }

  }


  /* =========================================================
     12. SCROLL REVEAL
     ========================================================= */

  const revealElements =
    document.querySelectorAll(
      "[data-db-reveal]"
    );


  if (
    "IntersectionObserver" in window
  ) {

    const revealObserver =
      new IntersectionObserver(
        function (entries) {

          entries.forEach(
            function (entry) {

              if (
                entry.isIntersecting
              ) {

                entry.target.classList.add(
                  "in-view"
                );


                revealObserver.unobserve(
                  entry.target
                );

              }

            }
          );

        },
        {
          threshold: 0.15
        }
      );


    revealElements.forEach(
      function (element) {

        const panel =
          element.closest(
            "[data-view-section], .db-view-panel"
          );


        if (
          panel &&
          (
            panel.classList.contains(
              "active"
            ) ||
            panel.classList.contains(
              "is-active"
            )
          )
        ) {

          element.classList.add(
            "in-view"
          );

        } else {

          revealObserver.observe(
            element
          );

        }

      }
    );

  } else {

    revealElements.forEach(
      function (element) {

        element.classList.add(
          "in-view"
        );

      }
    );

  }


  /* =========================================================
     13. MESSAGES
     ========================================================= */

  const messageList =
    document.getElementById(
      "dbMessageList"
    );


  const messages =
    window.DASHBOARD_MESSAGES ||
    [];


  function escapeHtml(value) {

    return String(
      value || ""
    ).replace(
      /[&<>"']/g,
      function (character) {

        return {

          "&":
            "&amp;",

          "<":
            "&lt;",

          ">":
            "&gt;",

          '"':
            "&quot;",

          "'":
            "&#39;"

        }[character];

      }
    );

  }


  function updateUnreadBadges() {

    const count =
      messages.filter(
        function (message) {

          return message.unread;

        }
      ).length;


    document
      .querySelectorAll(
        '.db-nav-badge[data-source="messages"]'
      )
      .forEach(
        function (badge) {

          badge.textContent =
            count;


          badge.style.display =
            count > 0
              ? "flex"
              : "none";

        }
      );


    document
      .querySelectorAll(
        '.db-badge[data-source="messages"]'
      )
      .forEach(
        function (badge) {

          badge.textContent =
            count;


          badge.style.display =
            count > 0
              ? "flex"
              : "none";

        }
      );

  }


  function renderMessages() {

    if (!messageList) {
      return;
    }


    messageList.innerHTML =
      "";


    messages.forEach(
      function (message) {

        const item =
          document.createElement(
            "div"
          );


        item.className =
          "db-msg-item" +
          (
            message.unread
              ? " unread"
              : ""
          );


        item.dataset.id =
          message.id;


        item.dataset.tag =
          String(
            message.tag || ""
          ).toLowerCase();


        item.innerHTML =

          '<span class="db-msg-unread-dot"></span>' +

          '<span class="db-msg-avatar">' +
            escapeHtml(
              message.initials
            ) +
          "</span>" +

          '<span class="db-msg-body">' +

            '<span class="db-msg-top-row">' +

              '<span class="db-msg-sender">' +
                escapeHtml(
                  message.sender
                ) +
              "</span>" +

              '<span class="db-msg-tag">' +
                escapeHtml(
                  message.tag
                ) +
              "</span>" +

              '<span class="db-msg-time">' +
                escapeHtml(
                  message.time
                ) +
              "</span>" +

            "</span>" +

            '<span class="db-msg-subject">' +
              escapeHtml(
                message.subject
              ) +
            "</span>" +

            '<span class="db-msg-preview">' +
              escapeHtml(
                message.preview
              ) +
            "</span>" +

            '<span class="db-msg-full">' +
              escapeHtml(
                message.full ||
                message.preview
              ) +
            "</span>" +

          "</span>";


        item.addEventListener(
          "click",
          function () {

            const expanded =
              item.classList.contains(
                "expanded"
              );


            messageList
              .querySelectorAll(
                ".db-msg-item.expanded"
              )
              .forEach(
                function (other) {

                  if (
                    other !== item
                  ) {

                    other.classList.remove(
                      "expanded"
                    );

                  }

                }
              );


            item.classList.toggle(
              "expanded",
              !expanded
            );


            if (
              item.classList.contains(
                "unread"
              )
            ) {

              item.classList.remove(
                "unread"
              );


              const original =
                messages.find(
                  function (msg) {

                    return (
                      msg.id ===
                      message.id
                    );

                  }
                );


              if (original) {

                original.unread =
                  false;

              }


              updateUnreadBadges();

            }

          }
        );


        messageList.appendChild(
          item
        );

      }
    );

  }


  renderMessages();

  updateUnreadBadges();


  /* =========================================================
     14. MESSAGE SEARCH / FILTER
     ========================================================= */

  const messageSearch =
    document.getElementById(
      "dbInboxSearch"
    );


  const messageChips =
    document.querySelectorAll(
      ".db-inbox-chip"
    );


  function applyMessageFilter() {

    if (!messageList) {
      return;
    }


    const activeChip =
      document.querySelector(
        ".db-inbox-chip.active"
      );


    const filter =
      activeChip
        ? (
            activeChip.dataset.filter ||
            "all"
          ).toLowerCase()
        : "all";


    const search =
      messageSearch
        ? messageSearch.value
            .trim()
            .toLowerCase()
        : "";


    let visible =
      0;


    messageList
      .querySelectorAll(
        ".db-msg-item"
      )
      .forEach(
        function (item) {

          const message =
            messages.find(
              function (msg) {

                return String(
                  msg.id
                ) ===
                String(
                  item.dataset.id
                );

              }
            );


          if (!message) {
            return;
          }


          let filterMatch =
            true;


          if (
            filter === "unread"
          ) {

            filterMatch =
              message.unread ===
              true;

          } else if (
            filter !== "all"
          ) {

            filterMatch =
              String(
                message.tag || ""
              ).toLowerCase() ===
              filter;

          }


          const text = (

            String(
              message.sender || ""
            ) +

            " " +

            String(
              message.subject || ""
            ) +

            " " +

            String(
              message.preview || ""
            ) +

            " " +

            String(
              message.full || ""
            )

          ).toLowerCase();


          const searchMatch =
            !search ||
            text.includes(
              search
            );


          const show =
            filterMatch &&
            searchMatch;


          item.classList.toggle(
            "hide",
            !show
          );


          if (show) {
            visible++;
          }

        }
      );


    const empty =
      document.getElementById(
        "dbMsgEmpty"
      );


    if (empty) {

      empty.classList.toggle(
        "show",
        visible === 0
      );

    }

  }


  messageChips.forEach(
    function (chip) {

      chip.addEventListener(
        "click",
        function () {

          messageChips.forEach(
            function (other) {

              other.classList.remove(
                "active"
              );

            }
          );


          chip.classList.add(
            "active"
          );


          applyMessageFilter();

        }
      );

    }
  );


  if (messageSearch) {

    messageSearch.addEventListener(
      "input",
      applyMessageFilter
    );

  }


  /* =========================================================
     15. TOP SEARCH
     ========================================================= */

  const topSearch =
    document.querySelector(
      ".db-search input"
    );


  if (topSearch) {

    topSearch.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key !==
          "Enter"
        ) {
          return;
        }


        const query =
          topSearch.value
            .trim()
            .toLowerCase();


        if (!query) {
          return;
        }


        if (
          query.includes(
            "order"
          )
        ) {

          if (
            findPanel(
              "orders"
            )
          ) {

            showView(
              "orders",
              true
            );

          }

          return;
        }


        if (
          query.includes(
            "wish"
          )
        ) {

          if (
            findPanel(
              "wishlist"
            )
          ) {

            showView(
              "wishlist",
              true
            );

          }

          return;
        }


        if (
          query.includes(
            "message"
          ) ||
          query.includes(
            "support"
          )
        ) {

          if (
            findPanel(
              "messages"
            )
          ) {

            showView(
              "messages",
              true
            );

          }

          return;
        }


        if (
          query.includes(
            "reward"
          )
        ) {

          if (
            findPanel(
              "rewards"
            )
          ) {

            showView(
              "rewards",
              true
            );

          }

          return;
        }


        if (
          query.includes(
            "setting"
          )
        ) {

          if (
            findPanel(
              "settings"
            )
          ) {

            showView(
              "settings",
              true
            );

          }

          return;
        }

      }
    );

  }


  /* =========================================================
     16. LOGOUT
     ========================================================= */

  document
    .querySelectorAll(
      'a[href="login.html"]'
    )
    .forEach(
      function (link) {

        link.addEventListener(
          "click",
          function () {

            localStorage.removeItem(
              "stacklyCurrentUser"
            );

            localStorage.removeItem(
              "stacklyUserName"
            );

            localStorage.removeItem(
              "stacklyUserEmail"
            );

            localStorage.removeItem(
              "stacklyUserRole"
            );

          }
        );

      }
    );


  /* =========================================================
     17. USER UPDATE EVENT
     ========================================================= */

  window.addEventListener(
    "stacklyUserUpdated",
    function () {

      updateDashboardUser();

    }
  );


  window.addEventListener(
    "storage",
    function (event) {

      if (

        event.key ===
          "stacklyCurrentUser" ||

        event.key ===
          "stacklyUserName" ||

        event.key ===
          "stacklyUserEmail" ||

        event.key ===
          "stacklyUserRole"

      ) {

        updateDashboardUser();

      }

    }
  );


  /* =========================================================
     18. FINAL INITIALIZATION
     ========================================================= */

  updateDashboardUser();

  loadHash();

});
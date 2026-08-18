/* =========================================================
   STACKLY — auth.js

   Handles:
   - Customer / Admin role
   - Password visibility
   - Signup validation
   - Save signup user
   - Login user lookup
   - Current logged-in user
   - Name from email fallback
   - Dashboard redirect
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     HELPERS
     ========================================================= */

  function normalizeEmail(email) {
    return String(email || '')
      .trim()
      .toLowerCase();
  }


  /* ---------------------------------------------------------
     Convert email address to a readable name

     Example:
     venkatalakshmi.priya@gmail.com
     ->
     Venkatalakshmi Priya
     --------------------------------------------------------- */

  function nameFromEmail(email) {

    const cleanEmail =
      normalizeEmail(email);

    const localPart =
      cleanEmail.split('@')[0];

    const words =
      localPart
        .replace(/[._-]+/g, ' ')
        .replace(/[0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (!words.length) {
      return 'User';
    }

    return words
      .map(word => {

        if (!word) return '';

        return (
          word.charAt(0).toUpperCase() +
          word.slice(1)
        );

      })
      .join(' ');
  }


  /* ---------------------------------------------------------
     Get saved users
     --------------------------------------------------------- */

  function getUsers() {

    try {

      return JSON.parse(
        localStorage.getItem(
          'stacklyUsers'
        )
      ) || {};

    } catch (error) {

      return {};

    }

  }


  /* ---------------------------------------------------------
     Save users
     --------------------------------------------------------- */

  function saveUsers(users) {

    localStorage.setItem(
      'stacklyUsers',
      JSON.stringify(users)
    );

  }


  /* ---------------------------------------------------------
     Save current logged-in user
     --------------------------------------------------------- */

  function saveCurrentUser(user) {

    localStorage.setItem(
      'stacklyCurrentUser',
      JSON.stringify(user)
    );

  }


  /* =========================================================
     DESKTOP CHECK
     ========================================================= */

  const isDesktop = () =>
    window.matchMedia(
      '(min-width:901px)'
    ).matches;


  /* =========================================================
     ROLE TOGGLE
     ========================================================= */

  const roleBtns =
    document.querySelectorAll(
      '.au-role-btn'
    );

  const roleIndicator =
    document.getElementById(
      'auRoleIndicator'
    );

  const roleLabelEls =
    document.querySelectorAll(
      '.au-role-label'
    );

  const orbitSat =
    document.getElementById(
      'auOrbitSat'
    );

  const satIcon =
    document.getElementById(
      'auSatIcon'
    );

  const roleField =
    document.getElementById(
      'auRoleField'
    );


  function setRole(role, btn) {

    roleBtns.forEach(button => {

      button.classList.toggle(
        'active',
        button === btn
      );

    });


    if (roleIndicator) {

      roleIndicator.style.transform =
        role === 'admin'
          ? 'translateX(100%)'
          : 'translateX(0)';

      roleIndicator.classList.toggle(
        'role-admin',
        role === 'admin'
      );

    }


    roleLabelEls.forEach(el => {

      el.textContent =
        role === 'admin'
          ? 'admin'
          : 'customer';

    });


    if (roleField) {

      roleField.value =
        role;

    }


    if (orbitSat) {

      orbitSat.classList.toggle(
        'role-admin',
        role === 'admin'
      );

    }


    if (satIcon && orbitSat) {

      orbitSat.classList.add(
        'icon-pop'
      );

      setTimeout(() => {

        satIcon.classList.remove(
          'fa-user',
          'fa-shield-halved'
        );

        satIcon.classList.add(
          role === 'admin'
            ? 'fa-shield-halved'
            : 'fa-user'
        );

        orbitSat.classList.remove(
          'icon-pop'
        );

      }, 160);

    }

  }


  roleBtns.forEach(btn => {

    btn.addEventListener(
      'click',
      () => {

        setRole(
          btn.dataset.role,
          btn
        );

      }
    );

  });


  /* =========================================================
     PASSWORD VISIBILITY
     ========================================================= */

  document
    .querySelectorAll('.au-pass-toggle')
    .forEach(toggle => {

      const field =
        toggle.closest('.au-field');

      const input =
        field
          ? field.querySelector('input')
          : null;

      if (!input) return;


      toggle.addEventListener(
        'click',
        () => {

          const showing =
            input.type === 'text';


          input.type =
            showing
              ? 'password'
              : 'text';


          const icon =
            toggle.querySelector('i');


          if (icon) {

            icon.classList.toggle(
              'fa-eye',
              showing
            );

            icon.classList.toggle(
              'fa-eye-slash',
              !showing
            );

          }


          toggle.setAttribute(
            'aria-label',
            showing
              ? 'Show password'
              : 'Hide password'
          );

        }
      );

    });


  /* =========================================================
     SUBMIT ANIMATION
     ========================================================= */

  function runSubmitSequence(
    btn,
    destination
  ) {

    btn.classList.add(
      'is-loading'
    );


    setTimeout(() => {

      btn.classList.remove(
        'is-loading'
      );

      btn.classList.add(
        'is-success'
      );


      setTimeout(() => {

        window.location.href =
          destination;

      }, 650);

    }, 1200);

  }


  /* =========================================================
     LOGIN
     ========================================================= */

  const loginForm =
    document.getElementById(
      'auLoginForm'
    );


  if (loginForm) {

    loginForm.addEventListener(
      'submit',
      (e) => {

        e.preventDefault();


        const btn =
          loginForm.querySelector(
            '.au-submit-btn'
          );


        if (
          !btn ||
          btn.classList.contains(
            'is-loading'
          ) ||
          btn.classList.contains(
            'is-success'
          )
        ) {

          return;

        }


        const emailInput =
          document.getElementById(
            'auEmail'
          );


        const email =
          normalizeEmail(
            emailInput
              ? emailInput.value
              : ''
          );


        const role =
          roleField
            ? roleField.value
            : 'customer';


        if (!email) {

          if (emailInput) {

            emailInput.focus();

          }

          return;

        }


        /* -----------------------------------------
           Find registered account
           ----------------------------------------- */

        const users =
          getUsers();


        let user =
          users[email];


        /* -----------------------------------------
           If account exists, use saved name
           ----------------------------------------- */

        if (user) {

          user = {

            name:
              user.name ||
              nameFromEmail(email),

            email:
              email,

            role:
              user.role ||
              role

          };

        }

        /* -----------------------------------------
           If account does not exist yet,
           create a temporary profile from email
           ----------------------------------------- */

        else {

          user = {

            name:
              nameFromEmail(email),

            email:
              email,

            role:
              role

          };


          /*
             Save it so the same name is available
             next time this email logs in.
          */

          users[email] = user;

          saveUsers(users);

        }


        /* -----------------------------------------
           Login role should match selected role
           ----------------------------------------- */

        user.role =
          role;


        /* -----------------------------------------
           SAVE CURRENT USER
           ----------------------------------------- */

        saveCurrentUser(
          user
        );


        /* -----------------------------------------
           Also save individual values
           for easy access if needed.
           ----------------------------------------- */

        localStorage.setItem(
          'stacklyUserName',
          user.name
        );

        localStorage.setItem(
          'stacklyUserEmail',
          user.email
        );

        localStorage.setItem(
          'stacklyUserRole',
          user.role
        );


        /* -----------------------------------------
           Redirect
           ----------------------------------------- */

        const destination =
          role === 'admin'
            ? 'admin-dashboard.html'
            : 'user-dashboard.html';


        runSubmitSequence(
          btn,
          destination
        );

      }
    );

  }


  /* =========================================================
     SIGNUP
     ========================================================= */

  const signupForm =
    document.getElementById(
      'auSignupForm'
    );


  if (signupForm) {

    signupForm.addEventListener(
      'submit',
      (e) => {

        e.preventDefault();


        const pass =
          document.getElementById(
            'auPassword'
          );


        const confirm =
          document.getElementById(
            'auConfirm'
          );


        const nameInput =
          document.getElementById(
            'auName'
          );


        const emailInput =
          document.getElementById(
            'auEmail'
          );


        const btn =
          signupForm.querySelector(
            '.au-submit-btn'
          );


        if (
          !btn ||
          btn.classList.contains(
            'is-loading'
          ) ||
          btn.classList.contains(
            'is-success'
          )
        ) {

          return;

        }


        /* -----------------------------------------
           Password confirmation
           ----------------------------------------- */

        if (
          pass &&
          confirm &&
          pass.value !== confirm.value
        ) {

          const field =
            confirm.closest(
              '.au-field'
            );


          if (field) {

            field.classList.add(
              'au-field-error'
            );

            confirm.focus();


            setTimeout(() => {

              field.classList.remove(
                'au-field-error'
              );

            }, 500);

          }


          return;

        }


        /* -----------------------------------------
           Get signup information
           ----------------------------------------- */

        const name =
          nameInput
            ? nameInput.value.trim()
            : '';


        const email =
          normalizeEmail(
            emailInput
              ? emailInput.value
              : ''
          );


        const role =
          roleField
            ? roleField.value
            : 'customer';


        if (!name) {

          if (nameInput) {

            nameInput.focus();

          }

          return;

        }


        if (!email) {

          if (emailInput) {

            emailInput.focus();

          }

          return;

        }


        /* -----------------------------------------
           Save account
           ----------------------------------------- */

        const users =
          getUsers();


        users[email] = {

          name:
            name,

          email:
            email,

          role:
            role

        };


        saveUsers(
          users
        );


        /* -----------------------------------------
           Save last signup information
           ----------------------------------------- */

        localStorage.setItem(
          'stacklyLastSignupEmail',
          email
        );

        localStorage.setItem(
          'stacklyLastSignupName',
          name
        );


        /* -----------------------------------------
           Go to login
           ----------------------------------------- */

        runSubmitSequence(
          btn,
          'login.html'
        );

      }
    );

  }


  /* =========================================================
     FLOATING PARTICLES
     ========================================================= */

  const visual =
    document.querySelector(
      '.au-visual'
    );


  if (visual) {

    const field =
      document.createElement(
        'div'
      );


    field.className =
      'au-particles';


    field.setAttribute(
      'aria-hidden',
      'true'
    );


    const count =
      isDesktop()
        ? 22
        : 12;


    let html = '';


    for (
      let i = 0;
      i < count;
      i++
    ) {

      const left =
        Math.random() * 100;


      const size =
        (
          Math.random() * 2.4 +
          1.4
        ).toFixed(1);


      const delay =
        (
          Math.random() * 10
        ).toFixed(2);


      const duration =
        (
          Math.random() * 8 +
          10
        ).toFixed(2);


      html +=
        '<span class="au-particle" ' +
        'style="left:' +
        left +
        '%;width:' +
        size +
        'px;height:' +
        size +
        'px;animation-delay:-' +
        delay +
        's;animation-duration:' +
        duration +
        's;"></span>';

    }


    field.innerHTML =
      html;


    visual.appendChild(
      field
    );

  }


  /* =========================================================
     ORBIT PARALLAX
     ========================================================= */

  const orbitScene =
    document.querySelector(
      '.au-orbit-scene'
    );


  if (
    orbitScene &&
    visual &&
    isDesktop()
  ) {

    visual.addEventListener(
      'mousemove',
      (e) => {

        const rect =
          visual.getBoundingClientRect();


        const px =
          (
            e.clientX -
            rect.left
          ) /
          rect.width -
          0.5;


        const py =
          (
            e.clientY -
            rect.top
          ) /
          rect.height -
          0.5;


        orbitScene.style.transform =
          'translate(' +
          (px * 16) +
          'px,' +
          (py * 16) +
          'px)';

      }
    );


    visual.addEventListener(
      'mouseleave',
      () => {

        orbitScene.style.transform =
          'translate(0,0)';

      }
    );

  }


  /* =========================================================
     MAGNETIC SUBMIT BUTTON
     ========================================================= */

  if (isDesktop()) {

    document
      .querySelectorAll(
        '.au-submit-btn'
      )
      .forEach(btn => {

        btn.addEventListener(
          'mousemove',
          (e) => {

            const rect =
              btn.getBoundingClientRect();


            const x =
              (
                e.clientX -
                rect.left -
                rect.width / 2
              ) * 0.18;


            const y =
              (
                e.clientY -
                rect.top -
                rect.height / 2
              ) * 0.35;


            btn.style.transform =
              'translate(' +
              x +
              'px,' +
              y +
              'px)';

          }
        );


        btn.addEventListener(
          'mouseleave',
          () => {

            btn.style.transform =
              'translate(0,0)';

          }
        );

      });

  }


  /* =========================================================
     FIELD FOCUS
     ========================================================= */

  document
    .querySelectorAll(
      '.au-field input'
    )
    .forEach(input => {

      input.addEventListener(
        'focus',
        () => {

          const field =
            input.closest(
              '.au-field'
            );


          if (field) {

            field.classList.add(
              'au-field-focus'
            );

          }

        }
      );


      input.addEventListener(
        'blur',
        () => {

          const field =
            input.closest(
              '.au-field'
            );


          if (field) {

            field.classList.remove(
              'au-field-focus'
            );

          }

        }
      );

    });

});
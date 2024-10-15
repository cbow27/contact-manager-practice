/*
Create a contact manager app. Features include, creating a contact, updating
a contact, deleting a contact implement a "tagging" feature, which allows 
you to create tags, such as "marketing," "sales," "engineering," and when 
you add/edit a contact, you can select a tag to attach to the contact. 
Finally, you can click on a tag and show all the contacts with that tag.

Features to implement: 
- Create/update/delete/add tag to contact: 
  - deleting should display 'Are you sure' with yes or no.
  - when you add/edit a contact, you can select a tag to attach
  - you can click on a tag and show all the contacts with that tag
- Search bar
  - if no contact found, should display 'There's no contacts starting 
  with *query*'.
  - query must match consecutive to contact i.e 'ob' will match bob
  but 'oob' wont.
- Use handlebars to dymanicly render content (i.e no contacts, contacts)

Data structure
- JSON objects
- forms

Algo
- Using handlebars home page should display list of contacts, if theres 
no contacts should display 'There is no contacts'.

- adding tags to contacts
  - create a function `buildListOfTags`, tags will be in a dropdown menu,
  contacts with no tags will be in categroy 'none'.
    - inside the function want to recieve all contacts, iterate through
    each contact and get each unique tag in an array. If contact doesnt have
    a tag will be an empty string
  - create a dropdown towards top of page

- filter by tag selection
  - I want to modify existing function `loadContacts` to accept a string 
  argument `filter` and set its default to '' if none is passed in.
  - if there is one passed in, before passing in the list of contacts to be 
  rendered by handlebars, i want to iterate through each contact and keep only
  ones that have the tag `filter`

- Create an 'add contact' button
  - once the button is clicked a 'Create Contact' form should display to 
  fill out. 'Full name', 'email', 'telephone number' must all be filled out
  - once form is filled out send the form using method 'POST', 
  http://localhost:3000/api/contacts/, once created should go back to
  home screen with list of contacts in order of creation time.

- Edit a contact
  - invoke method `displayEditModal`, add a 'submit' event listener to the edit
  contact form.
    - create an XMLHTTPrequest object, method will be 'PUT' and path will be 
    `http://localhost:3000/api/contacts/${contactId}`
    - add a 'load' event listener to the request, if status is good, hide the 
    edit contact form, invoke method `loadCOntacts.

- Delete a contact
  - add an event listener to the contactsList element, check if clicked element 
  was a delete button by checking the id name
  - Get the contacts id number for the saveEditButton event listener

- search feature
  - i need to create a search bar on top of page have the word 'search' as
  place holder. Attach event listener 'input'
  - Search will only be for first or last name, case doesnt matter. create a
  function `loadContactsBySearch` that takes one parameter `query`.
  - 
*/ 
document.addEventListener('DOMContentLoaded', event => {
  const addButton = document.getElementById("addContact");
  const formCancelButton = document.getElementById('cancelButton');
  const contactList = document.getElementById("contactsList");
  const cancelEditButton = document.getElementById('cancelEditButton');
  const dropDown = document.getElementById('tagsDropdown');
  const searchBar = document.getElementById("searchBar");
  let contactForm = document.getElementById('contactForm');

  function createListOfTags() {
    let tags = [];
    let request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:3000/api/contacts');
    request.responseType = 'json';
    request.send();

    request.addEventListener('load', event => {
      let contacts = request.response;
      for(let i = 0; i < contacts.length; i += 1) {
        let currentContactTags = contacts[i].tags.split(/[\s,]+/);
        currentContactTags.forEach(ele => {
          tags.includes(ele.toUpperCase()) ? null : tags.push(ele.toUpperCase());
        });
      }

      let dropDown = document.getElementById('tagsDropdown');
      dropDown.innerHTML = '';

      let defaultOption = document.createElement('option');
      defaultOption.value = 'no filter';
      defaultOption.textContent = 'no filter';
      dropDown.appendChild(defaultOption)

      tags.forEach(ele => {
        let option = document.createElement('option');
        option.value = ele;
        option.textContent = ele;

        if(option.value !== '') {
          dropDown.appendChild(option);
        }
      });

    });
  }

  function loadContacts(filter = '') {
    let request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:3000/api/contacts');
    request.responseType = 'json';
    request.send();

    request.addEventListener('load', event => {
      let contacts = request.response;
      let contactTemplate = Handlebars.compile($('#contactsTemplate').html());

      if(filter !== 'no filter' && filter !== '') {
        let filteredContacts = [];

        for(let i = 0; i < contacts.length; i += 1) {
          let currentContact = contacts[i];
          let listOfTags = currentContact.tags.split(/[\s,]+/).map(tag => tag.toUpperCase());

          listOfTags.includes(filter) ? filteredContacts.push(currentContact) : null;
        }

        contacts = filteredContacts
      }

      let context = {contacts: contacts}
      let html = contactTemplate(context);

      $('#contactsList').html('');
      $('#contactsList').append(html);
    });

  }

  function loadContactsBySearch(query) {
    let regex = new RegExp(query, 'i');
    let filteredContacts = [];

    let request = new XMLHttpRequest();
    request.open('GET', 'http://localhost:3000/api/contacts');
    request.responseType = 'json';
    request.send();

    request.addEventListener('load', event => {
      let contacts = request.response;
      let contactTemplate = Handlebars.compile($('#contactsTemplate').html());
      
      for(let i = 0; i < contacts.length; i += 1) {
        let currentContact = contacts[i];
        regex.test(currentContact.full_name) ? filteredContacts.push(currentContact) : null;
      }

      let context = {contacts: filteredContacts}
      let html = contactTemplate(context);

      $('#contactsList').html('');
      $('#contactsList').append(html);
    });
  }

  createListOfTags();
  loadContacts();
  
  function displayForm() {
    let form = document.getElementById('contactForm');
    form.reset();
    form.style.display = 'block';
  }

  function hideForm() {
    let form = document.getElementById('contactForm');
    form.style.display = 'none';
  }

  function displayEditModal(contactId) {
    let editModal = document.getElementById('editContactModal');
    editModal.dataset.contactId = contactId;

    let request = new XMLHttpRequest();
    request.open('GET', `http://localhost:3000/api/contacts/${contactId}`, true);
    request.responseType = 'json';
    request.send();
  
    request.onload = function() {
      if (request.status >= 200 && request.status < 300) {
        let contact = request.response;
  
        editModal.style.display = 'block';
  
        document.getElementById('edit_full_name').value = contact.full_name;
        document.getElementById('edit_email').value = contact.email;
        document.getElementById('edit_phone_number').value = contact.phone_number;
        document.getElementById('edit_tags').value = contact.tags;
      } else {
        console.error('Failed to fetch contact');
      }
    }

  }

  function hideEditModal() {
    let editModal = document.getElementById('editContactModal');
    editModal.style.display = 'none';
  }

  function handleEditSubmit(event, contactId) {
    event.preventDefault();
  
    let data = JSON.stringify({
      full_name: document.getElementById('edit_full_name').value,
      email: document.getElementById('edit_email').value,
      phone_number: document.getElementById('edit_phone_number').value,
      tags: document.getElementById('edit_tags').value
    });
  
    let request = new XMLHttpRequest();
    request.open('PUT', `http://localhost:3000/api/contacts/${contactId}`);
    request.setRequestHeader('Content-Type', 'application/json');
  
    request.addEventListener('load', event => {
      if (request.status >= 200 && request.status < 300) {
        hideEditModal();
        loadContacts();
        createListOfTags();
      } else {
        alert('Error occurred, unable to save contact');
      }
    });
  
    request.send(data);
  }

  function deleteContact(contactId) {
    let request = new XMLHttpRequest();
    request.open('DELETE', `http://localhost:3000/api/contacts/${contactId}`);
    request.send();
  }

  //displays contact form
  addButton.addEventListener('click', event => {
    displayForm(contactForm);
  });

  //displays contacts filtered by tag
  dropDown.addEventListener('change', event => {
    let selectedFilter = event.target.value;
    loadContacts(selectedFilter);
  })

  //Removes contact form
  formCancelButton.addEventListener('click', event => {
    hideForm(contactForm);
  });

  //Removes edit modal
  cancelEditButton.addEventListener('click', event => {
    hideEditModal();
  });

  //Submits form to create contact
  contactForm.addEventListener('submit', event => {
    event.preventDefault();

    let data = JSON.stringify({
      full_name: document.getElementById('full_name').value,
      email: document.getElementById('email').value,
      phone_number: document.getElementById('phone_number').value,
      tags: document.getElementById('tags').value
    });

    let request = new XMLHttpRequest();
    request.open(contactForm.method, contactForm.action)
    request.setRequestHeader('Content-Type', 'application/json');

    request.addEventListener('load', event => {
      if (request.status >= 200 && request.status < 300) {
        hideForm(contactForm);
        loadContacts();
        createListOfTags();
      } else {
        alert('Error occured, unable to save contact');
      }
    });

    request.send(data);
  });

  //Performs search queries
  searchBar.addEventListener('input', event => {
    let query = event.target.value.trim();
    loadContactsBySearch(query);
  })

  //deletes/edits a specifed contact
  contactList.addEventListener('click', event => {
    let contact = event.target.closest('li');
    let contactId = contact.getAttribute('data-id');
    let elementClassName = event.target.classList[0];
    let editContactForm = document.getElementById("editContactForm");

    if(elementClassName === 'deleteContact') {
      let proceed = confirm('Are you sure you want to delete this contact?');

      if(proceed) {
        deleteContact(contactId)
        createListOfTags();
        loadContacts();
      }

    } else if(elementClassName === "editContact") {
      displayEditModal(contactId);
      editContactForm.removeEventListener('submit', handleEditSubmit);

      editContactForm.addEventListener('submit', event => {
        handleEditSubmit(event, contactId);
      });
    }
  });
});
console.log('Hello World');

const BASE_URL = 'http://localhost:5000/api/v1';

const Product = {
    index() {
        return fetch(`${BASE_URL}/products`).then(response => {
            return response.json();
        });
    },
    create(params) {
        return fetch(`${BASE_URL}/products`, {
            method: 'POST',
            credentials: 'include', //need this for cookies
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        }).then(res => res.json());
    },
    show(id) {
        return fetch(`${BASE_URL}/products/${id}`).then(res => res.json());
    },
    update(id, params) {
        return fetch(`${BASE_URL}/products/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify(params),
        }).then(res => res.json());
    },
    destroy(id) {
        return fetch(`${BASE_URL}/products/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-type': 'application/json',
            },
        }).then(res => res.json());
    },
};

//Sign In AJAX Helper
const Session = {
    create(params) {
        return fetch(`${BASE_URL}/session`, {
            method: 'POST',
            credentials: 'include', //need for cookies to be allowed to be sent cross-origin
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        }).then(res => res.json());
    },
};

//Hacky Sign-in / "Mock" sign in
Session.create({
    email: 'sms0330@gmail.com',
    password: '0414',
});

//Navigation

function navigateTo(id) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    document.querySelector(`.page#${id}`).classList.add('active');

    document.querySelectorAll('a.item').forEach(page => {
        page.classList.remove('active');
    });

    const navLink = document.querySelector(`a[data-target=${id}]`);
    if (navLink) navLink.classList.add('active');
}

//declare a container for the list of products
const productsContainer = document.querySelector('.product-list');

//Index loading products
function loadProducts() {
    Product.index().then(products => {
        productsContainer.innerHTML = products
            .map(p => {
                return `
                <li>
                    <a class="product-link" data-id=${p.id}" href="#">${p.id} - ${p.title}</a>
                </li>
            `;
            })
            .join('');
    });
}

function renderProductShowPage(id) {
    const productShowPage = document.querySelector('#product-show');
    Product.show(id).then(({ id, title, description, price, reviews, seller }) => {
        productShowPage.innerHTML = `
        <h2>${title}</h2>
        <p>${description}</p>
        <small>Price: $${price}</small>
        <small><br>Posted by: ${seller.full_name}</small>
        <h3>Reviews</h3>
        <ul>
            ${reviews.map(a => '<li>' + a.body + '</li>').join('')}
        </ul>
        <div>
        <button data-action="product-edit" data-id="${id}" href="#">Edit</button>
        <button data-action="product-delete" data-id="${id}" href="#">Delete</button>
        </div>
        `;
        navigateTo('product-show');
    });
}

function populateForm(id) {
    Product.show(id).then(productData => {
        console.log(productData);
        document.querySelector('#edit-product-form [name=title]').value = productData.title;
        document.querySelector('#edit-product-form [name=description]').value =
            productData.description;
        document.querySelector('#edit-product-form [name=price]').value = productData.price;
        document.querySelector('#edit-product-form [name=id]').value = productData.id;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    const navbar = document.querySelector('.menu.navbar');

    navbar.addEventListener('click', event => {
        const navLink = event.target.closest('a');

        if (navLink) {
            event.preventDefault();
            const pageId = navLink.dataset.target;
            navigateTo(pageId);
        }
    });

    productsContainer.addEventListener('click', event => {
        event.preventDefault();
        if (event.target.matches('a.product-link')) {
            const productId = event.target.dataset.id;
            renderProductShowPage(productId);
        }
    });

    const newProductForm = document.querySelector('#new-product-form');
    newProductForm.addEventListener('submit', event => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        const newProductParams = {
            title: formData.get('title'),
            description: formData.get('description'),
            price: formData.get('price'),
        };
        Product.create(newProductParams).then(({ id }) => {
            console.log(`Product ${id} has been created!`);
            form.reset();
            loadProducts();
            renderProductShowPage(id);
            navigateTo('product-show');
        });
    });

    document.querySelector('#product-show').addEventListener('click', event => {
        const link = event.target.closest("[data-action]");
        if (link) {
            const targetPage = link.getAttribute("data-action");
            const id = link.getAttribute("data-id");
            event.preventDefault();
            if (targetPage.indexOf('delete') > -1) {
                Product.destroy(id).then(res => {
                    console.log(`Deleted: ${id}`);
                    loadProducts();
                    navigateTo('product-index');
                });
            } else {
                console.log(`Edit: ${id}`);
                populateForm(id); 
                navigateTo('product-edit'); 
            }
        }
    });

    const editProductForm = document.querySelector('#edit-product-form'); //selecting a form with this query selection using id
    editProductForm.addEventListener('submit', event => {
        event.preventDefault();
        const editFormData = new FormData(event.currentTarget); //grabbing data from the form using formData
        const updatedProductParams = {
            title: editFormData.get('title'),
            description: editFormData.get('description'),
            price: editFormData.get('price'),
        };

        Product.update(editFormData.get('id'), updatedProductParams) //using update method of Product to submit new form data
            .then(product => {
                console.log(`Product ${product.id} has been updated!`);
                editProductForm.reset(); //removes any existing content
                loadProducts();
                renderProductShowPage(product.id);
                navigateTo('product-show');
            });
    });
});

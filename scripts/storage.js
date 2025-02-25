const STORAGE_TOKEN = 'L5RTBI0CUNLBAKCKTENSEC0RH6QHS1HYDWMHQLNW';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';

async function setItem(key, value) {
    const payload = { key, value, token: STORAGE_TOKEN };
    return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) })
        .then(res => res.json());
}

async function getItem(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    return fetch(url).then(res => res.json()).then(res => {
        if (res.data) { 
            return res.data.value;
        } throw `Could not find data with key "${key}".`;
    });
}

async function loadLoginUser() {
    try {
        loginUser = JSON.parse(await getItem('loginUser'));
    } catch (e) {
        console.info('No User found.');
    }
}


function renderLoginUserName(location) {
    document.getElementById('activeUser' + location).innerHTML = loginUser[1];
}
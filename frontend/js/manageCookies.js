export function setCookie(cookieName, cookieContent){
    let expirationSeconds = 3600 //one hour
    let date = new Date();
    date.setTime(date.getTime() + expirationSeconds*1000)
    let expires = "expires=" + date.toUTCString();

    document.cookie = `${cookieName}=${cookieContent}; expires=${expires}; SameSite=None; Secure; path=/`
}

export function getCookie(cookieName){
    let name = cookieName + "="
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookieArray = decodedCookie.split("; ");
    let rtn = "";

    cookieArray.forEach( cookie => {
        if (cookie.indexOf(name) == 0){
            rtn = cookie.substr(name.length, cookie.length)
        }
    })

    return rtn
}

export function eraseAllCookies(){
    let cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++){
        eraseCookie(cookies[i].split("=")[0]);
    }
}

function eraseCookie(name) {
    setCookie(name,"");
}
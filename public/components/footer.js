document.addEventListener("DOMContentLoaded",function() {
	fetch("components/footer.html")
.then(res => res.text())
.then(data => { 
const container = decument.getElementById("dynamic-footer");
if (container)
	container.innerHTML =data;
})
.catch(err => consol.error("مشکل در نمایش فوتر ", err));
});
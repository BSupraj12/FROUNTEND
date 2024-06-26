const options = {
  dragging: false,
  touchZoom: false,
  doubleClickZoom: false,
  scrollWheelZoom: false,
  zoomControl: false
}

const lat = document.querySelector('span[data-lat]')
const lng = document.querySelector('span[data-lng]')

let map = L.map('mapid', options).setView([lat.dataset.lat, lng.dataset.lng], 15)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

const icon = L.icon({
  iconUrl: "/images/map-marker.svg",
  iconSize: [58, 68],
  iconAnchor: [29, 68],
  popupAnchor: [170, 2]
})



L.marker([lat.dataset.lat, lng.dataset.lng], { icon }).addTo(map)


function selectImage(event) {
  const button = event.currentTarget
  const allButtons = document.querySelectorAll(".images button")
  allButtons.forEach(removeActiveClass) 

  function removeActiveClass(button) {
    button.classList.remove('active')
  }

  const image = button.children[0]
  const imageContainer = document.querySelector(".orphanage-details > img")

  imageContainer.src = image.src

  button.classList.add('active')
}
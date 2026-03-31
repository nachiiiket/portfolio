// MENU
document.getElementById("nav-toggle").onclick = () =>{
    document.getElementById("nav-menu").classList.toggle("show")
}

// DARK MODE
const toggle = document.getElementById("theme-toggle")
toggle.onclick = ()=>{
    document.body.classList.toggle("light")
}

// TYPING EFFECT
const text = ["AI/ML Engineer","LLM Developer","RAG Specialist"]
let i=0, j=0, current="", isDeleting=false

function type(){
    current = text[i]
    
    if(isDeleting){
        document.getElementById("typing").textContent =
            current.substring(0,j--)
    }else{
        document.getElementById("typing").textContent =
            current.substring(0,j++)
    }

    if(!isDeleting && j===current.length){
        isDeleting=true
        setTimeout(type,1000)
        return
    }

    if(isDeleting && j===0){
        isDeleting=false
        i=(i+1)%text.length
    }

    setTimeout(type,100)
}
type()

// SCROLL REVEAL
const reveals = document.querySelectorAll(".reveal")

window.addEventListener("scroll", ()=>{
    reveals.forEach(el=>{
        const top = el.getBoundingClientRect().top
        if(top < window.innerHeight - 100){
            el.classList.add("active")
        }
    })
})

// GITHUB PROJECTS AUTO LOAD
fetch("https://api.github.com/users/nachiiiket/repos")
.then(res=>res.json())
.then(data=>{
    const container = document.getElementById("github-projects")

    data.slice(0,6).forEach(repo=>{
        const div = document.createElement("div")
        div.className="card"

        div.innerHTML = `
            <h3>${repo.name}</h3>
            <p>${repo.description || "No description"}</p>
            <a href="${repo.html_url}" target="_blank">View</a>
        `

        container.appendChild(div)
    })
})
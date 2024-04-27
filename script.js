let startScreen = document.querySelector(".start")
let startInputs = document.querySelectorAll(".start input")
let startBtn = document.querySelector(".start form")

let quizScreen = document.querySelector(".quiz")
let quizAnswersBtns = document.querySelectorAll(".answers button")
let quizQuestImg = document.querySelector(".question img")

let quizScreenCounter = document.querySelector(".quiz__counter")
let quizScreenTimer = document.querySelector(".quiz__timer")

let endScreen = document.querySelector(".end")
let endRestartBtn = document.querySelector(".end .restart")
let endHomeBtn = document.querySelector(".end .to-home")
let endResult = document.querySelector(".end__result")

let endStatsContainer = document.querySelector(".end ul")

let allQuestion = []
let currQuestion = {}
let currQuestionNumber
let userPoint

let initalTimer
let time = 15

let allUsers = []
let isUser

function startTimer() {
	quizScreenTimer.innerHTML = time

	initalTimer = setInterval(() => {
		if (time === 1) {
			time = 0
			showNextQuestion()
			changeColor("#AB1A2A")
		} else {
			time--
		}
		quizScreenTimer.innerHTML = time
	}, 1000)
}

function startQuiz() {
	startScreen.classList.remove("active")
	endScreen.classList.remove("active")
	quizScreen.classList.add("active")

	currQuestionNumber = 0
	userPoint = 0

	generateQuestion()
}

function endQuiz() {
	startScreen.classList.remove("active")
	quizScreen.classList.remove("active")
	endScreen.classList.add("active")
	endResult.innerHTML = `You reached ${userPoint}/${currQuestionNumber} points`

	if (isUser[0]) {
		if (isUser[0].maxPoint > userPoint) {
			updateUser({
				...isUser[0],
				lastPoint: userPoint
			}).then((data) => {
				let index = allUsers.findIndex(el => el.id == data.id)
				allUsers[index] = data
				renderStats(allUsers)
			})
		} else {
			updateUser({
				...isUser[0],
				maxPoint: userPoint,
				lastPoint: userPoint
			}).then((data) => {
				let index = allUsers.findIndex(el => el.id == data.id)
				allUsers[index] = data
				renderStats(allUsers)
			})
		}
	} else {
		isUser = [{
			userLogin: startInputs[0].value,
			userPassword: startInputs[1].value,
			maxPoint: userPoint,
			lastPoint: userPoint
		}]
		addUser(isUser[0]).then((data) => {
			allUsers.push(data)
			renderStats(allUsers)
		})
	}
}

function renderStats(users) {
	endStatsContainer.innerHTML = ""
	users.sort((a, b) => +b.maxPoint - +a.maxPoint).forEach(user => {
		endStatsContainer.innerHTML += `<li>${user.userLogin} - ${user.maxPoint}</li>`
	})
}

function generateQuestion() {
	currQuestion = allQuestion[currQuestionNumber]
	quizScreenCounter.innerHTML = `${currQuestionNumber + 1}/10`
	time = 15
	startTimer()

	quizQuestImg.src = currQuestion["country-img"]
	quizAnswersBtns.forEach((btn, index) => {
		btn.innerHTML = currQuestion["all-answers"][index]
	})
	turnBtn(false)
}

function changeColor(color) {
	document.body.style.background = color
	document.body.classList.add("activeBackround")

	setTimeout(() => {
		document.body.style.background = "#003399"
	}, 800)
}

startBtn.addEventListener("submit", (event) => {
	event.preventDefault()

	getUser()
		.then(data => allUsers = data)
		.then(() => {
			isUser = allUsers.filter(el => el.userLogin === startInputs[0].value && el.userPassword === startInputs[1].value)
		})

	startQuiz()
})

endRestartBtn.addEventListener("click", startQuiz)

endHomeBtn.addEventListener("click", () => location.reload())

quizAnswersBtns.forEach(btn => {
	btn.addEventListener("click", () => {
		turnBtn(true)
		if (btn.innerHTML === currQuestion["correct-answer"]) {
			changeColor("#00A839")
			userPoint++
		} else {
			changeColor("#AB1A2A")
		}

		console.log("Hello")

		showNextQuestion()
	})
})

function showNextQuestion() {
	currQuestionNumber++
	clearInterval(initalTimer)

	setTimeout(() => {
		if (currQuestionNumber > 9) {
			endQuiz()
		} else {
			generateQuestion()
		}
	}, 800)
}

function turnBtn(option) {
	quizAnswersBtns.forEach(btn => btn.disabled = option)
}

fetch('./data.json')
	.then(response => response.json())
	.then(JSON => { allQuestion = JSON["all-questions"] })

async function addUser(newUser) {
	let res = await fetch(`https://6623c4ba3e17a3ac8470283a.mockapi.io/quiz-flags`, {
		method: `POST`,
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(newUser)
	})
	let data = await res.json()
	return data
}

async function updateUser(oldUser) {
	let res = await fetch(`https://6623c4ba3e17a3ac8470283a.mockapi.io/quiz-flags/${oldUser.id}`, {
		method: `PUT`,
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(oldUser)
	})
	let data = await res.json()
	return data
}

async function getUser() {
	let res = await fetch("https://6623c4ba3e17a3ac8470283a.mockapi.io/quiz-flags")
	let data = await res.json()
	return data
}


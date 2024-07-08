document.getElementById('addButton').addEventListener('click', () => {
    // Получение текущего URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTabUrl = tabs[0].url;

        const data = getData(currentTabUrl);

        // Создание POST-запроса на сервер
        fetch('https://getdatawallsandals.onrender.com/wall-api/addNewGroup', {
            // Замените URL на ваш серверный
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                // Обработка успешного ответа
                if (!data.status) {
                    document.getElementById('result').textContent =
                        'Группа добавлена!';
                } else {
                    document.getElementById('result').textContent = 'Ошибка';
                }
            })
            .catch(() => {
                // Обработка ошибок
                document.getElementById('result').textContent = 'Ошибка';
            });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Функция для выполнения POST-запроса на сервер
    function sendUrlToServer() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            // Блокируем кнопку
            document.getElementById('addButton').disabled = true;
            // Скрываем текст кнопки и показываем анимацию загрузки
            document.getElementById('buttonText').style.display = 'none';
            document.getElementById('loading').style.display = 'inline';

            const currentTabUrl = tabs[0].url;

            if (!currentTabUrl.includes('vk.com')) {
                document.getElementById('result').textContent = 'Это не ВК )';
                return;
            }

            const data = getData(currentTabUrl);

            fetch(
                'https://getdatawallsandals.onrender.com/wall-api/checkGroup',
                {
                    // Замените URL на ваш серверный
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                }
            )
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    if (!data.exist) {
                        // Восстанавливаем кнопку
                        document.getElementById('addButton').disabled = false;
                        // Скрываем анимацию загрузки и показываем текст кнопки
                        document.getElementById('loading').style.display =
                            'none';
                        document.getElementById('buttonText').style.display =
                            'inline';
                    } else {
                        document.getElementById('result').textContent =
                            'Уже добавлена!';
                    }
                })
                .catch(() => {
                    document.getElementById('result').textContent = 'Ошибка';
                });
        });
    }

    // Автоматический вызов функции при открытии popup
    sendUrlToServer();
});

function getData(currentTabUrl) {
    const data = {
        url: null,
        type: null,
    };

    if (currentTabUrl.includes('wall')) {
        const regex = /wall([^_]+)_/;
        const match = currentTabUrl.match(regex);
        if (match) {
            const extractedPart = match[1];
            data.url = extractedPart;
            data.type = extractedPart.includes('-') ? 'group' : 'user';
        } else {
            document.getElementById(
                'result'
            ).textContent = `Не удалось найти соответствие`;
            return;
        }
    } else {
        data.url = currentTabUrl.split('/').pop();
        data.type = 'screen';
    }

    return data;
}

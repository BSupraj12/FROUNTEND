class Trade {
    constructor() {
        this.send({
            token: localStorage.getItem('access_token')
        }, '/api/authorized', 'POST', this.setAccessMode);
    }

    setAccessMode(data) {
        this.userInfo = data.user;

        if (data.user) {
            document.body.classList.add('authorized');
            document.getElementById('userName').innerHTML = data.user.name;
            document.getElementById('userName').href = '/user-detail';
        }

        this.iniialize();
    }

    iniialize() {
        var url = location.href;

        if (url.indexOf('/user-detail') > 0) {
            this.getHtml('/api/user-detail');
        } else if (url.indexOf('/trades/list') > 0) {
            this.getHtml('/api/trades');
        } else if (url.indexOf('/trades/new') > 0) {
            this.getHtml('/api/trades/new');
        } else if (url.indexOf('/trades/view') > 0) {
            this.getHtml('/api/trades/' + url.split('trades/view/')[1]);
        } else if (url.indexOf('/trades/edit') > 0) {
            this.getHtml('/api/trades/' + url.split('trades/edit/')[1] + '/edit');
        }
    }

    login() {
        const form = document.getElementsByTagName('form')[0],
            values = this.isValid(form, ['username', 'password']);

        if (values) {
            this.send(values, '/api/signin', 'POST', this.startSession);
        }
    }

    startSession(data) {
        localStorage.setItem('access_token', data.token);
        location.href = "/";
    }

    register() {
        const form = document.getElementsByTagName('form')[0],
            values = this.isValid(form, ['email', 'password', 'confirm_password', 'first_name', 'last_name']);

        if (values) {
            delete values.confirm_password;
            this.send(values, '/api/signup', 'POST', this.startSession);
        }
    }

    save() {
        const form = document.getElementsByTagName('form')[0],
            values = this.isValid(form, ['name', 'topic', 'details', 'avatar_url', 'id']);

        if (values) {
            const id = values.id || '';
            this.send(values, "/api/trade/" + id, id ? 'PUT' : 'POST');
        }
    }

    isValid(form, fields) {
        const elements = form.elements,
            validators = this.getValidators(),
            displayNames = {
                name: 'Item Name',
                topic: 'Category',
                details: 'Details',
                first_name: 'First Name',
                last_name: 'Last Name',
                email: 'Email',
                password: 'Password',
                confirm_password: 'Confirm Password'
            },
            values = {},
            messages = [];

        let value, rules, name;

        for (let i = 0, len = fields.length; i < len; i++) {
            name = fields[i];
            rules = validators[name] || {};
            value = elements[name].value.trim();

            if (rules.mandatory && !value) {
                messages.push(displayNames[name] + ' can\'t be left blank.');
            } else if (rules.minLength && value.length < rules.minLength) {
                messages.push(displayNames[name] + ' can\'t be less then ' + rules.minLength + ' characters.');
            } else if (rules.maxLength && value.length > rules.maxLength) {
                messages.push(displayNames[name] + ' can\'t be greater then ' + rules.maxLength + ' characters.');
            } else if (rules.equals && elements[rules.equals].value.trim() !== value) {
                messages.push(displayNames[name] + ' and ' + displayNames[rules.equals] + ' are not matching.');
            } else {
                values[name] = value;
            }
        }

        if (messages.length > 0) {
            this.show(messages.join('\n'), 'Form validtion Falied');
        } else {
            return values;
        }
    }

    getValidators() {
        return {
            name: {
                mandatory: true,
                minLength: 3,
                maxLength: 20
            },
            topic: {
                mandatory: true
            },
            details: {
                mandatory: true
            },
            first_name: {
                mandatory: true
            },
            last_name: {
                mandatory: true
            },
            email: {
                mandatory: true
            },
            password: {
                mandatory: true
            },
            confirm_password: {
                mandatory: true,
                equals: 'password'
            }
        };
    }

    send(values, url, method, callback) {
        fetch(url, {
            method: method || 'POST',
            body: JSON.stringify(values),
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        }).then(response => response.json()).then(data => {
            if (data.success) {
                if (callback) {
                    callback.call(this, data);
                } else {
                    this.show(data.msg, 'Success');
                    location.href = '/trades/view/' + data.id;
                }
            } else {
                throw data.msg;
            }
        }).catch(ex => {
            this.show(ex.message || ex, 'API Failed');
        });
    }

    updateWatch(btn) {
        var id = document.getElementById('id').value;

        fetch("/api/trade/watch", {
            method: 'POST',
            body: JSON.stringify({
                id: id
            }),
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        }).then(response => response.json()).then(data => {
            if (data.success) {
                btn.innerHTML = data.added ? 'Delete from Watch List' : 'Add To Watch List';
            } else {
                throw data.msg;
            }
        }).catch(ex => {
            this.show(ex.message || ex, 'API Failed');
        });
    }

    getHtml(url) {
        fetch(url, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                'Content-Type': 'text/html'
            },
        }).then(response => response.text()).then(html => {
            if (html.charAt(0) === '{') {
                const json = JSON.parse(html);
                html = '<div class="center-container error"><h3>' + json.code + ': &nbsp;' + json.msg + '</h3></div>';
            }

            document.getElementById('details').innerHTML = html;
        }).catch(ex => {
            this.show(ex.message || ex, 'API Failed');
        });
    }

    delete() {
        if (confirm("Are you sure you want to delete item ?") == true) {
            const id = document.getElementById('id').value;

            fetch("/api/trade/" + id, {
                method: 'DELETE',
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
            }).then(response => response.json()).then(data => {
                if (data.success) {
                    this.show(data.msg, 'Success');
                    location.href = '/trades/list';
                } else {
                    throw data.msg;
                }
            }).catch(ex => {
                this.show(ex.message || ex, 'API Failed');
            });
        }
    }

    onOfferTradeClick() {
        document.getElementById('trade-btn-container').hidden = true;
        document.getElementById('offer-container').hidden = false;
    }

    cancelTrade() {
        document.getElementById('trade-btn-container').hidden = false;
        document.getElementById('offer-container').hidden = true;
    }

    submitTrade() {
        var id = document.getElementById('id').value,
            offerItemId = document.getElementById('tradedItem').value;

        fetch("/api/trade/offer", {
            method: 'POST',
            body: JSON.stringify({
                trade_item: id,
                offer_item: offerItemId
            }),
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        }).then(response => response.json()).then(data => {
            if (data.success) {
                location.reload();
            } else {
                throw data.msg;
            }
        }).catch(ex => {
            this.show(ex.message || ex, 'API Failed');
        });
    }

    acceptOffer(id) {
        fetch("/api/trade/offer/accept", {
            method: 'POST',
            body: JSON.stringify({
                offer_id: id
            }),
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        }).then(response => response.json()).then(data => {
            if (data.success) {
                location.reload();
            } else {
                throw data.msg;
            }
        }).catch(ex => {
            this.show(ex.message || ex, 'API Failed');
        });
    }

    rejectOffer(id) {
        fetch("/api/trade/offer/reject", {
            method: 'POST',
            body: JSON.stringify({
                offer_id: id
            }),
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('access_token'),
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        }).then(response => response.json()).then(data => {
            if (data.success) {
                location.reload();
            } else {
                throw data.msg;
            }
        }).catch(ex => {
            this.show(ex.message || ex, 'API Failed');
        });
    }

    logout() {
        localStorage.removeItem('access_token');
        location.href = "/";
    }

    show(message, type) {
        alert('--  ' + type + '  --\n' + message);
    }
}

TradeClass = new Trade();
exports.index = (req, res) => {
    res.render('index');
};

exports.contact = (req, res) => {
    res.render('contact');
};

exports.about = (req, res) => {
    res.render('about');
};

// html pages handlers
exports.container = async (req, res) => {
    res.render('./common/container');
};
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl
        req.flash("error", "login/edit to make changes")
        return res.redirect("/login")
    }
    next()
}
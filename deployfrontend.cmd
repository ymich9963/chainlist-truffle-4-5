robocopy src docs /e
robocopy build\contracts docs
git add .
git commit -m "Adding files to Github pages"
git push
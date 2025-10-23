const nodeSchedule = require('node-schedule');
const twitterController = require('./twitterController');
const linkedinController = require('./linkedinController');
const facebookController = require('./facebookController');


const handlePost = async (req, res) => {
    const text = req.body.text
	const accounts = JSON.parse(req.body.accounts)
	const postType = req.body.postType
	const scheduledTime = req.body.scheduledTime
	const files = req.files;
	console.log(req.body)
    try {
		for(const account of accounts){
        let job, postId;
        if (account.platform === 'Twitter') {
            if (postType === 'now') {
                const postResponse = await twitterController.postTweet({
                    body: { text: text,  accountId: account.account_id, files: files},
                }, res);
            }
			 else {
                // postId = await twitterModel.createTwitterPost(accountId, content, scheduledTime, null, 'scheduled');
                job = nodeSchedule.scheduleJob(new Date(scheduledTime), async () => {
                    try {
                        const postResponse = await twitterController.postTweet({
                            body: { text: text,  accountId: account.account_id, files: files},
                        }, {
                            send: (message) => console.log(message),
                            render: (view, options) => console.log(view, options)
                        });
                        console.log('Scheduled tweet response:', postResponse); // Log the entire response
                        // const postLink = `https://twitter.com/${accountId}/status/${postResponse.id}`;
                        // await twitterModel.updatePostStatusById(postId, 'posted', postLink);
                    } catch (error) {
                        console.error('Error posting scheduled tweet:', error);
                        // Handle error notification here if needed
                    }
                });
            }
        } else if (account.platform === 'Linkedin') {
            if (postType === 'now') {
                const postResponse = await linkedinController.postToLinkedIn({
					body: { text: text,  accountId: account.account_id, files: files},
                }, res);
            } else {
                // postId = await linkedinModel.createLinkedinPost(accountId, content, scheduledTime, null, 'scheduled');
                job = nodeSchedule.scheduleJob(new Date(scheduledTime), async () => {
                    try {
                        const postResponse = await linkedinController.postToLinkedIn({
                            body: { text: text,  accountId: account.account_id, files: files},
                        }, {
                            send: (message) => console.log(message),
                            render: (view, options) => console.log(view, options)
                        });
                        
                    } catch (error) {
                        console.error('Error posting scheduled LinkedIn post:', error);
                        // Handle error notification here if needed
                    }
                });
            }
        }
		else if(account.platform = "Facebook"){
			if (postType === 'now') {
                const postResponse = await facebookController.postToFacebook({
					body: { text: text,  accountId: account.account_id, files: files},
                }, res);
			}
			else {
                // postId = await linkedinModel.createLinkedinPost(accountId, content, scheduledTime, null, 'scheduled');
                job = nodeSchedule.scheduleJob(new Date(scheduledTime), async () => {
                    try {
                        const postResponse = await facebookController.postToFacebook({
                            body: { text: text,  accountId: account.account_id, files: files},
                        }, {
                            send: (message) => console.log(message),
                            render: (view, options) => console.log(view, options)
                        });
                        // const postLink = `https://www.linkedin.com/feed/update/${postResponse.id}`;
                        // await linkedinModel.updatePostStatusById(postId, 'posted', postLink);
                    } catch (error) {
                        console.error('Error posting scheduled LinkedIn post:', error);
                        // Handle error notification here if needed
                    }
                });
            }
			// return res.status(200).json({message: "Post successful"})
		} else {
            return res.status(400).send('Invalid platform specified.');
        }
	}
    } catch (error) {
		console.log(error)
        return res.status(400).send('Some thing wrong happend');

    }finally{
        return res.status(200).json({message: 'Post successful'})
    }
	
};

module.exports = {
    handlePost
};

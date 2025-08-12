const { Account, LinkedinAccount, Post } = require('../models');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs').promises;
dotenv.config();

const LINKEDIN_OAUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';
const LINKEDIN_POST_URL = 'https://api.linkedin.com/v2/ugcPosts';
const LINKEDIN_MEDIA_UPLOAD_URL = 'https://api.linkedin.com/v2/assets?action=registerUpload';

const postToLinkedIn = async (req, res) => {
    const text = req.body.text;
    const accountId = req.body.accountId;
    const files = req.body.files; // Binary file passed as multipart/form-data
    let file = null
    if(files){
        file = files[0]
        console.log(file)
    }
    try {
        const linkedinAccount = await LinkedinAccount.findOne({
            where: { account_id: accountId },
        });
        if (!linkedinAccount) {
            return res.status(400).send('LinkedIn account not found for the user.');
        }

        const accessToken = linkedinAccount.access_token;
        const linkedinUrn = `urn:li:person:${linkedinAccount.linkedin_user_id}`;

        if (!accessToken || !linkedinUrn) {
            return res.status(400).send('Session expired or invalid. Please re-authenticate.');
        }

        let mediaUrn = null;

        // Step 1: Upload binary file if provided
        if (file) {
            try {
                // 1.1 Register upload with LinkedIn
                const uploadResponse = await axios.post(
                    LINKEDIN_MEDIA_UPLOAD_URL,
                    {
                        registerUploadRequest: {
                            owner: linkedinUrn,
                            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
                            serviceRelationships: [
                                {
                                    identifier: 'urn:li:userGeneratedContent',
                                    relationshipType: 'OWNER',
                                },
                            ],
                        },
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                            'X-Restli-Protocol-Version': '2.0.0',
                        },
                    }
                );

                const uploadUrl =
                    uploadResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']
                        .uploadUrl;
                mediaUrn = uploadResponse.data.value.asset;

                // 1.2 Upload the binary file to the returned upload URL
                const fileBuffer = await fs.readFile(file.path);
                await axios.put(uploadUrl, fileBuffer, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': file.mimetype,
                    },
                });

                console.log('Media uploaded successfully:', mediaUrn);
            } catch (uploadError) {
                console.error('Media upload failed:', uploadError.response?.data || uploadError.message);
                return res.status(400).send('Failed to upload media to LinkedIn.');
            }
        }

        // Step 3: Create the post body
        const postBody = {
            author: linkedinUrn,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    shareCommentary: {
                        text: text,
                    },
                    shareMediaCategory: mediaUrn ? 'IMAGE' : 'NONE',
                    media: mediaUrn
                        ? [
                            {
                                status: 'READY',
                                description: {
                                    text: text,
                                },
                                media: mediaUrn,
                                title: {
                                    text: 'Your Image Title Here',
                                },
                            },
                        ]
                        : [],
                },
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
            },
        };

        // Step 4: Post to LinkedIn
        const postResponse = await axios.post(LINKEDIN_POST_URL, postBody, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Restli-Protocol-Version': '2.0.0',
            },
        });

        const postPlatformId = postResponse.data.id; // Assuming LinkedIn API returns `id` in the response
        console.log("Post to linkedin successful")
        const postLink = `https://www.linkedin.com/feed/update/urn:li:share:${postPlatformId}`;
        const newPost = await Post.create({
            account_id: accountId,
            post_platform_id: postPlatformId,
            post_link: postLink,
            content: text,
            status: 'posted',
        });

        // return res.status(200).send(postResponse.data);
    } catch (error) {
        console.error('Error posting to LinkedIn:', error.response ? error.response.data : error.message);
        // if (error.response && error.response.status === 401) {
        //     return res.redirect('/auth/linkedin');
        // }
        return error;
    }
};

module.exports = {
    postToLinkedIn,
};

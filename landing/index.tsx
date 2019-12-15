import React, { Fragment } from 'react'
import Helmet from 'react-helmet'
import { navigate } from 'gatsby'
import { handleLogin } from '../src/app/services/auth'

export const LandingPage = () => {
    return (
        <>
            <Helmet>
                {' '}
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                <meta name="description" content="" />
                <meta name="author" content="" />
                <title>GIFun - Your private and secure GIF storage and generator</title>
                <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
                <link href="vendor/fontawesome-free/css/all.min.css" rel="stylesheet" />
                <link rel="stylesheet" href="vendor/simple-line-icons/css/simple-line-icons.css" />
                <link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet" />
                <link
                    href="https://fonts.googleapis.com/css?family=Catamaran:100,200,300,400,500,600,700,800,900"
                    rel="stylesheet"
                />
                <link href="https://fonts.googleapis.com/css?family=Muli" rel="stylesheet" />
                <link rel="stylesheet" href="device-mockups/device-mockups.min.css" />
                <link href="css/new-age.css" rel="stylesheet" />
                <script
                    src="https://code.jquery.com/jquery-3.4.1.min.js"
                    integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
                    crossorigin="anonymous"
                ></script>
                <script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
                <script src="vendor/jquery-easing/jquery.easing.min.js"></script>
                <script src="js/new-age.min.js"></script>
            </Helmet>

            <div id="page-top">
                <div
                    className="logoContainer"
                    style={{ display: 'flex', alignItems: 'center', position: 'absolute', zIndex: 1, margin: 50 }}
                >
                    <img src="img/gifun.png" style={{ width: 80, height: 80 }}></img>
                    <h3 style={{ color: 'white' }}>
                        <b>GIFun</b>
                    </h3>
                </div>

                <header className="masthead">
                    <div className="container h-100">
                        <div className="row h-100">
                            <div className="col-lg-7 my-auto">
                                <div className="header-content mx-auto">
                                    <h1 className="mb-5">
                                        Your new fun, fully customizable, and secure GIF storage and generator
                                    </h1>
                                    <a
                                        onClick={() => {
                                            handleLogin(() => {
                                                navigate(`/app`)
                                            })
                                        }}
                                        className="btn btn-outline btn-xl js-scroll-trigger"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Login with Blockstack
                                    </a>
                                </div>
                            </div>
                            <div className="col-lg-5 my-auto">
                                <img
                                    src="img/pointleft.gif"
                                    className="landingGif pointLeft"
                                    style={{ borderRadius: 10 }}
                                    alt=""
                                />
                                <img src="img/pointup.gif" className="landingGif pointUp" style={{ borderRadius: 10 }} alt="" />
                                {/* <div className="device-container">
                                    <div className="device-mockup macbook_2015 portrait white" style={{width:}}>
                                        <div className="device">
                                            <div className="screen">
                                                
                                            </div>
                                            <div className="button"></div>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </header>

                <section className="features" id="features">
                    <div className="container">
                        <div className="section-heading text-center">
                            <h2>Secure, Private, and Fun</h2>
                            <p className="text-muted">Have fun creating and rest assured your data is secured</p>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 my-auto">
                                <div className="container-fluid">
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <div className="feature-item">
                                                <i className="icon-user text-primary"></i>
                                                <h3>Private</h3>
                                                <p className="text-muted">
                                                    You own your data! No third party company can sell or manipulate your data
                                                </p>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="feature-item">
                                                <i className="icon-lock text-primary"></i>
                                                <h3>Secure</h3>
                                                <p className="text-muted">
                                                    All the sensitive data is encrypted and uploaded onto a decentralized network
                                                    powered by blockchain technology. No one, but you can access your data
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <div className="feature-item">
                                                <i className="icon-present text-primary"></i>
                                                <h3>Free to Use</h3>
                                                <p className="text-muted">It's a gift</p>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="feature-item">
                                                <i className="icon-heart text-primary"></i>
                                                <h3>Fun</h3>
                                                <p className="text-muted">
                                                    Create and customize your own GIFs from webcam, videos, and other GIFs, and
                                                    share them with your besties
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="contact" style={{ backgroundColor: '#222222', padding: 50 }} id="contact">
                    <div className="container">
                        {/* <h2 style={{ color: 'white' }}>Contact Us</h2> */}
                        <a href="mailto:team@gifun" className="btn btn-outline btn-xl js-scroll-trigger">
                            Contact Us
                        </a>
                    </div>
                </section>

                <footer>
                    <div className="container">
                        <p>&copy; GIFun 2019. All Rights Reserved.</p>
                    </div>
                </footer>
            </div>
            <Helmet></Helmet>
        </>
    )
}

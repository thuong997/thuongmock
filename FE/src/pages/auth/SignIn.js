import { Formik, Form, FastField } from "formik";
import React, { useState } from "react";
import { ReactstrapInput } from "reactstrap-formik"
import * as Yup from 'yup';
import { Link } from "react-router-dom";
import LoginApi from "../../api/LoginApi";
import { withRouter } from "react-router";

import {
  Button,
  Card,
  CardBody,
  FormGroup,
  CustomInput,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from "reactstrap";

import avatar from "../../assets/img/avatars/avatar.jpg";
import storage from "../../Storage/Storage";
import { toastr } from "react-redux-toastr";
import UserApi from "../../api/UserApi";
import { setUserLoginInfo, setTokenInfo } from "../../redux/actions/UserLoginInfoActions";
import { connect } from "react-redux";

const showErrorNotification = (title, message) => {
  const options = {
    timeOut: 3000,
    showCloseButton: false,
    progressBar: false,
    position: 'top-left'
  };
  // show notification
  toastr.error(title, message, options);
}

const SignIn = (props) => {

  const [isOpenModal, setOpenModal] = useState(false);

  const [email, setEmail] = useState(false);

  const [isDisableResenButton, setDisableResenButton] = useState(false);

  const resendEmailToActiveAccount = async () => {
    setDisableResenButton(true);
    await UserApi.resendEmailToActiveAccount(email);
    setDisableResenButton(false);

  }

  // remember me
  const [checkedRememberMe, setCheckedRememberMe] = useState(storage.isRememberMe());

  return (
    <React.Fragment>
      <div className="text-center mt-4">
        <h2>Welcome to VTI Academy</h2>
        <p className="lead">Sign in to your account to continue</p>
      </div>

      <Formik
        initialValues={
          {
            username: '',
            password: '',
          }
        }
        validationSchema={
          Yup.object({
            username: Yup.string()
              .min(6, "Must be between 6-50 character or greater")
              .max(50, "Must be between 6-50 character or greater")
              .required('Required'),
            password: Yup.string()
              .min(6, "Must be between 6-50 character or greater")
              .max(50, "Must be between 6-50 character or greater")
              .required('Required'),
          })

        }
        onSubmit={
          async (values) => {
            try {
              // call api 
              const result = await LoginApi.login(
                values.username,
                values.password
              );

              // check user  active
              if (result.token === null || result.token === undefined) {
                setEmail(result.email);
                setOpenModal(true);
              } else {
                // set remember me
                storage.setRememberMe(checkedRememberMe)

                // save token & user info to storage
                storage.setToken(result.token);
                storage.setUserInfo(
                  result.userName,
                  result.email,
                  result.firstName,
                  result.lastName,
                  result.role,
                  result.status
                );

                // save token & user info to redux
                props.setTokenInfo(result.token);
                props.setUserLoginInfo(
                  result.userName,
                  result.email,
                  result.firstName,
                  result.lastName,
                  result.role,
                  result.status
                );

                // redirect to home page
                props.history.push("/groups");
              }
            } catch (error) {
              console.log(error);
              if (error.status === 401) {
                // redirect page error server 
                showErrorNotification('Login Faill !', 'Wrong Username or Password !');
              } else {
                props.history.push("/auth/500");
              }
            }
          }
        }
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ isSubmitting }) => (
          <Card>
            <CardBody>
              <div className="m-sm-4">
                <div className="text-center">
                  <img
                    src={avatar}
                    alt="Chris Wood"
                    className="img-fluid rounded-circle"
                    width="132"
                    height="132"
                  />
                </div>
                <Form>
                  <FormGroup>
                    <FastField
                      label='User Name'
                      type='text'
                      bsSize="lg"
                      name="username"
                      placeholder="Enter your user name"
                      component={ReactstrapInput}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FastField
                      label='Password'
                      type='password'
                      bsSize="lg"
                      name="password"
                      placeholder="Enter your password"
                      component={ReactstrapInput}
                    />

                    <small>
                      <Link to="/auth/reset-password">Forgot password?</Link>
                    </small><br></br>

                  </FormGroup>

                  <div>
                    <CustomInput
                      type="checkbox"
                      id="rememberMe"
                      label="Remember me next time"
                      defaultChecked={checkedRememberMe}
                      onChange={() => setCheckedRememberMe(!checkedRememberMe)}
                    />
                  </div>
                  <div className="text-center mt-3">
                    <Button type='submit' disabled={isSubmitting} color="primary" size="lg">
                      Sign in
                    </Button>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: '30px' }}>

                    <Link to="/auth/sign-up">Or Sign Up Using</Link>

                  </div>

                </Form>
              </div>
            </CardBody>
          </Card>
        )}
      </Formik>

      <Modal isOpen={isOpenModal}>

        <ModalHeader> You need to active your account </ModalHeader>

        <ModalBody className=" m-3">
          <p className='mb-0'> Your account is not active </p>
          <p className='mb-0'>Please check your email (<b>{email}.</b>) to active account</p>
        </ModalBody>

        <ModalFooter>

          <Button color="primary" onClick={resendEmailToActiveAccount} disabled={isDisableResenButton} >
            Resend
          </Button>{" "}

          <Button color='primary' onClick={() => setOpenModal(false)}>
            Close
          </Button>

        </ModalFooter>
      </Modal>
    </React.Fragment>
  )
};


export default connect(null, { setUserLoginInfo, setTokenInfo })(withRouter(SignIn));

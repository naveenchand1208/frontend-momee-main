const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiRoutes = {
  //User api's
  login: `${BASE_URL}/auth/login`,
  userList: `${BASE_URL}/auth/getUserList`,
  updateUSer: `${BASE_URL}/auth/updateUserProfile`,
  logout: `${BASE_URL}/auth/logout`,
  viewPregMom: `${BASE_URL}/auth/getUserProfile`,
  userReport: `${BASE_URL}/auth/userReport`,
  userExport: `${BASE_URL}/auth/userDownloadExcel`,
  moodTrackerReport: `${BASE_URL}/tracker/list`,
  waterConsumptionReport: `${BASE_URL}/consumption/timeBasedlist`,
  activeUsersCount: `${BASE_URL}/auth/getActiveUsersCount`,
  inActiveUsersCount: `${BASE_URL}/auth/getInactiveUserCounts`,
  ageWiseUserReport: `${BASE_URL}/auth/getUsersByAgeWiseReport`,
  getActiveInactiveUsersExcel: `${BASE_URL}/auth/activeInactiveUserExcel`,
  getBumpCountReport: `${BASE_URL}/bumbCount/getBumpCountReport`,
  getTrimesterCount: `${BASE_URL}/auth/trimesterCounts`,
  getTrimesterExcelReport: `${BASE_URL}/auth/trimesterExcel`,
  getWeekCount: `${BASE_URL}/auth/weekCounts`,
  getWeekExcelReport: `${BASE_URL}/auth/weekExcel`,
  deleteMom: `${BASE_URL}/auth/delete`,
  //User api's End

  //Subscription api's
  AddSubscription: `${BASE_URL}/subscription/add`,
  ViewSubscription: `${BASE_URL}/subscription/view`,
  UpdateSubscription: `${BASE_URL}/subscription/update`,
  subscriptionList: `${BASE_URL}/subscription/list`,
  userPlanlist: `${BASE_URL}/subscription/userPlanlist`,
  // subscriptionExport: `${BASE_URL}/subscription/subscriptionDownloadExcel`,
  //Subscription api's End

  //Diet Subscription api's
  addDietSubscription: `${BASE_URL}/dietSubscription/add`,
  getDietSubscriptionList: `${BASE_URL}/dietSubscription/list`,
  viewDietSubscription: `${BASE_URL}/dietSubscription/view`,
  updateDietSubscription: `${BASE_URL}/dietSubscription/update`,
  deleteDietSubscription: `${BASE_URL}/dietSubscription/delete`,
  userSubscription: `${BASE_URL}/dietSubscription/userSubscription`,
  userDietPlanlist: `${BASE_URL}/dietSubscription/userPlanlist`,
  activateUserPlan: `${BASE_URL}/dietSubscription/activateUserPlan`,
  //Diet Subscription api's End

  //Exercises Subscription api's
  addExerciseSubscription: `${BASE_URL}/exerciseSubscription/add`,
  getExerciseSubscriptionList: `${BASE_URL}/exerciseSubscription/list`,
  viewExerciseSubscription: `${BASE_URL}/exerciseSubscription/view`,
  updateExerciseSubscription: `${BASE_URL}/exerciseSubscription/update`,
  deleteExerciseSubscription: `${BASE_URL}/exerciseSubscription/delete`,
  userExerciseSubscription: `${BASE_URL}/exerciseSubscription/userSubscription`,
  userExercisePlanlist: `${BASE_URL}/exerciseSubscription/userPlanlist`,
  activateUserExercisePlan: `${BASE_URL}/exerciseSubscription/activateUserPlan`,
  //Exercises Subscription api's End

  //Diet Food Eat api's
  addDietFood: `${BASE_URL}/dietFood/add`,
  getDietFoodEatList: `${BASE_URL}/dietFood/list`,
  viewDietFood: `${BASE_URL}/dietFood/view`,
  updateDietFood: `${BASE_URL}/dietFood/update`,
  deleteDietFood: `${BASE_URL}/dietFood/delete`,
  dateWiseDietFood: `${BASE_URL}/dietFood/dateWiseFoodList`,
  //Diet Food Eat api's end 

  //Diet Food Avoid api's
  addDietAvoidFood: `${BASE_URL}/dietAvoidFood/add`,
  getDietAvoidFoodList: `${BASE_URL}/dietAvoidFood/list`,
  viewDietAvoidFood: `${BASE_URL}/dietAvoidFood/view`,
  updateDietAvoidFood: `${BASE_URL}/dietAvoidFood/update`,
  deleteDietAvoidFood: `${BASE_URL}/dietAvoidFood/delete`,
  dateWiseDietAvoidFood: `${BASE_URL}/dietAvoidFood/dateWiseFoodList`,
  //Diet Food Avoid api's end

  //Articles Category api's
  getArticlesCategoryList: `${BASE_URL}/artCat/list`,
  addArticlesCategory: `${BASE_URL}/artCat/add`,
  viewArticlesCategory: `${BASE_URL}/artCat/view`,
  updateArticlesCategory: `${BASE_URL}/artCat/update`,
  deleteArticlesCategory: `${BASE_URL}/artCat/delete`,
  updateIndexArticlesCategory: `${BASE_URL}/artCat/updateIndex`,
  //Articles Category api's End

  //Articles api's
  getArticlesList: `${BASE_URL}/article/list`,
  addArticles: `${BASE_URL}/article/add`,
  updateArticles: `${BASE_URL}/article/update`,
  viewArticles: `${BASE_URL}/article/view`,
  deleteArticles: `${BASE_URL}/article/delete`,
  updateIndexArticles: `${BASE_URL}/article/updateIndex`,
  articleSearchlist: `${BASE_URL}/article/articleSearchlist`,
  //Articles api's End

  //Community Category api's
  getCommunityCategoryList: `${BASE_URL}/comCat/list`,
  updateCommunityCategory: `${BASE_URL}/comCat/update`,
  addCommunityCategory: `${BASE_URL}/comCat/add`,
  deleteCommunityCatwgory: `${BASE_URL}/comCat/delete`,
  deleteCommunityCatwgory: `${BASE_URL}/comCat/delete`,
  //Community Category api's End

  //Community api's
  getCommunityList: `${BASE_URL}/community/list`,
  getCommentList: `${BASE_URL}/community/commentList`,
  communitySearchlist: `${BASE_URL}/community/communitySearchlist`,
  deleteCommunity: `${BASE_URL}/community/delete`,
  communityLikesCount: `${BASE_URL}/community/communityLikesCount`,
  communityCommentsCount: `${BASE_URL}/community/communityCommentsCount`,
  approveCommunity: `${BASE_URL}/community/approveCommunity`,
  deleteComment: `${BASE_URL}/community/deleteCommunityComment`,
  communityCommentsLikesCount: `${BASE_URL}/community/communityCommentsLikesCount`,
  //Community api's End

  //Hospital api's
  addHospital: `${BASE_URL}/hospital/add`,
  updateHospital: `${BASE_URL}/hospital/update`,
  viewHospitals: `${BASE_URL}/hospital/view`,
  getHospitalList: `${BASE_URL}/hospital/list`,
  //Hospital api's End

  //Food Avoid Category api's
  addFoodAvoidCategory: `${BASE_URL}/foodAvoidCat/add`,
  getFoodAvoidCategoryList: `${BASE_URL}/foodAvoidCat/list`,
  viewFoodAvoidCategoryList: `${BASE_URL}/foodAvoidCat/view`,
  updateFoodAvoidCategory: `${BASE_URL}/foodAvoidCat/update`,
  deleteFoodAvoidCategory: `${BASE_URL}/foodAvoidCat/delete`,
  updateIndexFoodAvoidCategory: `${BASE_URL}/foodAvoidCat/updateIndex`,
  //Food Avoid Category api's End

  //Food Eat Category api's
  addFoodEatCategory: `${BASE_URL}/foodEatCat/add`,
  getFoodEatCategoryList: `${BASE_URL}/foodEatCat/list`,
  viewFoodEatCategoryList: `${BASE_URL}/foodEatCat/view`,
  updateFoodEatCategory: `${BASE_URL}/foodEatCat/update`,
  deleteFoodEatCategory: `${BASE_URL}/foodEatCat/delete`,
  updateIndexFoodEatCategory: `${BASE_URL}/foodEatCat/updateIndex`,
  //Food Eat Category api's End

  //Food to avoid api's
  addFoodsAvoid: `${BASE_URL}/foodAvoid/add`,
  viewFoodsAvoid: `${BASE_URL}/foodAvoid/view`,
  updateFoodsAvoid: `${BASE_URL}/foodAvoid/update`,
  getFoodsAvoidList: `${BASE_URL}/foodAvoid/list`,
  deleteFoodsAvoid: `${BASE_URL}/foodAvoid/delete`,
  //Food to avoid api's End

  //Food to eat api's
  addFoodsEat: `${BASE_URL}/foodEat/add`,
  viewFoodsEat: `${BASE_URL}/foodEat/view`,
  updateFoodsEat: `${BASE_URL}/foodEat/update`,
  getFoodsEatList: `${BASE_URL}/foodEat/list`,
  deleteFoodsEat: `${BASE_URL}/foodEat/delete`,
  //Food to eat api's End

  //Food Template api's
  addFoodTemplate: `${BASE_URL}/foodTemplate/add`,
  viewFoodTemplate: `${BASE_URL}/foodTemplate/view`,
  getFoodTemplateList: `${BASE_URL}/foodTemplate/list`,
  updateFoodTemplate: `${BASE_URL}/foodTemplate/update`,
  deleteFoodTemplate: `${BASE_URL}/foodTemplate/delete`,
  //Food Template api's End

  //Exercise api's
  addCollection: `${BASE_URL}/exercise/add`,
  updateCollection: `${BASE_URL}/exercise/update`,
  addExercises: `${BASE_URL}/exercise/addExercise`,
  getCollectionList: `${BASE_URL}/exercise/list`,
  viewCollection: `${BASE_URL}/exercise/view`,
  viewExercises: `${BASE_URL}/exercise/viewExercise`,
  deleteExerciseCollection: `${BASE_URL}/exercise/delete`,
  updateExercises: `${BASE_URL}/exercise/updateExercise`,
  deleteExercises: `${BASE_URL}/exercise/deleteExercise`,
  //Exercise api's end

  //Master Exercise api's
  addMasterExercise: `${BASE_URL}/masterExercise/add`,
  updateMasterExercise: `${BASE_URL}/masterExercise/update`,
  getMasterExercise: `${BASE_URL}/masterExercise/list`,
  viewMasterExercise: `${BASE_URL}/masterExercise/view`,
  deleteMasterExercise: `${BASE_URL}/masterExercise/delete`,
  //Master Exercise api's end

  //Custom Exercise api's
  addCustomExercise: `${BASE_URL}/customExercise/add`,
  getCustomExerciseList: `${BASE_URL}/customExercise/list`,
  viewCustomExercise: `${BASE_URL}/customExercise/view`,
  updateCustomExercise: `${BASE_URL}/customExercise/update`,
  deleteCustomExercise: `${BASE_URL}/customExercise/delete`,
  dateWiseCustomExercise: `${BASE_URL}/customExercise/dateWiseExerciseList`,
  //Custom Exercise api's end

  //Book api's 
  addBook: `${BASE_URL}/book/add`,
  updateBook: `${BASE_URL}/book/update`,
  viewBook: `${BASE_URL}/book/view`,
  getBookList: `${BASE_URL}/book/list`,
  deleteBook: `${BASE_URL}/book/delete`,
  //Book api's end

  //Music Playlists api's
  getMusicList: `${BASE_URL}/music/list`,
  updateMusic: `${BASE_URL}/music/update`,
  addMusic: `${BASE_URL}/music/add`,
  viewMusic: `${BASE_URL}/music/view`,
  addPlaylist: `${BASE_URL}/music/addPlayList`,
  viewPlaylist: `${BASE_URL}/music/viewPlayList`,
  updatePlaylist: `${BASE_URL}/music/updatePlayList`,
  deleteMusic: `${BASE_URL}/music/delete`,
  deletePlaylist: `${BASE_URL}/music/deletePlayList`,
  //Music api's end

  //Book api's 
  addPodCasts: `${BASE_URL}/podCasts/add`,
  updatePodCasts: `${BASE_URL}/podCasts/update`,
  viewPodCasts: `${BASE_URL}/podCasts/view`,
  getPodCastsList: `${BASE_URL}/podCasts/list`,
  deletePodCasts: `${BASE_URL}/podCasts/delete`,
  //Book api's end

  //Badges api's 
  addBadges: `${BASE_URL}/batch/add`,
  updateBadges: `${BASE_URL}/batch/update`,
  viewBadges: `${BASE_URL}/batch/view`,
  getBadgesList: `${BASE_URL}/batch/list`,
  deleteBadges: `${BASE_URL}/batch/delete`,
  //Badges api's end

  //Products api's
  getProductList: `${BASE_URL}/product/list`,
  addProducts: `${BASE_URL}/product/add`,
  viewProducts: `${BASE_URL}/product/view`,
  updateProducts: `${BASE_URL}/product/update`,
  deleteProducts: `${BASE_URL}/product/delete`,
  //Product api's end

  //Orders api's 
  addOrders: `${BASE_URL}/product/addOrder`,
  updateOrders: `${BASE_URL}/product/updateOrder`,
  viewOrders: `${BASE_URL}/product/viewOrder`,
  getOrdersList: `${BASE_URL}/product/orderList`,
  deleteOrders: `${BASE_URL}/product/deleteOrder`,
  ordersExport: `${BASE_URL}/product/orderDownloadExcel`,
  //Orders api's end

  //Journey api's
  getJourneyList: `${BASE_URL}/journey/list`,
  updateJourney: `${BASE_URL}/journey/update`,
  addJourney: `${BASE_URL}/journey/add`,
  viewJourney: `${BASE_URL}/journey/view`,
  deleteJourney: `${BASE_URL}/journey/delete`,
  //Journey api's end

  //SOS api's
  getSosRequestList: `${BASE_URL}/sos/sosRequestList`,
  addSosMember: `${BASE_URL}/sos/addSosMember`,
  addSosRequest: `${BASE_URL}/sos/addSosRequest`,
  //SOS api's end

  //Banner api's
  getBannerList: `${BASE_URL}/banner/list`,
  addBanner: `${BASE_URL}/banner/add`,
  updateBanner: `${BASE_URL}/banner/update`,
  viewBanner: `${BASE_URL}/banner/view`,
  deleteBanner: `${BASE_URL}/banner/delete`,
  //Banner api's end

  //Hospital Type api's
  getHospitalTypeList: `${BASE_URL}/hospitalType/list`,
  addHospitalType: `${BASE_URL}/hospitalType/add`,
  updateHospitalType: `${BASE_URL}/hospitalType/update`,
  viewHospitalType: `${BASE_URL}/hospitalType/view`,
  deleteHospitalType: `${BASE_URL}/hospitalType/delete`,
  hospitalExport: `${BASE_URL}/hospital/hospitalDownloadExcel`,
  //Hospital Type api's end

  //Hospital Department api's
  getHospitalDeptList: `${BASE_URL}/hospitalDepartment/list`,
  addHospitalDept: `${BASE_URL}/hospitalDepartment/add`,
  updateHospitalDept: `${BASE_URL}/hospitalDepartment/update`,
  viewHospitalDept: `${BASE_URL}/hospitalDepartment/view`,
  deleteHospitalDept: `${BASE_URL}/hospitalDepartment/delete`,
  //Hospital Department api's end

  //Live Session api's
  getLiveSessionList: `${BASE_URL}/liveSession/list`,
  addLiveSession: `${BASE_URL}/liveSession/add`,
  updateLiveSession: `${BASE_URL}/liveSession/update`,
  viewLiveSession: `${BASE_URL}/liveSession/view`,
  deleteLiveSession: `${BASE_URL}/liveSession/delete`,
  userLiveClassPlanlist: `${BASE_URL}/liveSession/userPlanlist`,
  //Live Session api's end

  //Live Session Notification api's
  addSessionNotification: `${BASE_URL}/liveSessionNotify/add`,
  getNotificationList: `${BASE_URL}/liveSessionNotify/list`,
  viewNotification: `${BASE_URL}/liveSessionNotify/view`,
  //Live Session Notification api's end

  //Dashboard count api
  getDashboardCountList: `${BASE_URL}/auth/dashboardCount`,

  //User Feedback api's
  getUserFeedbackList: `${BASE_URL}/userFeedback/list`,
  addUserFeedback: `${BASE_URL}/userFeedback/add`,
  viewUserFeedback: `${BASE_URL}/userFeedback/view`,
  updateUserFeedback: `${BASE_URL}/userFeedback/update`,
  deleteUserFeedback: `${BASE_URL}/userFeedback/delete`,

  //Admin Chat api's
  getAdminChats: `${BASE_URL}/adminChat/list`,
  addAdminChats: `${BASE_URL}/adminChat/add`,
  viewAdminChats: `${BASE_URL}/adminChat/view`,
  //Admin Chat api's

  //Custom Notification api's
  getCustomNotify: `${BASE_URL}/customNotify/list`,
  addCustomNotify: `${BASE_URL}/customNotify/add`,
  viewCustomNotify: `${BASE_URL}/customNotify/view`,
  getNotificationLogs: `${BASE_URL}/customNotify/logList`,

  //Refund Policy api's
  getRefundPolicy: `${BASE_URL}/refund/list`,
  addRefundPolicy: `${BASE_URL}/refund/add`,
  viewRefundPolicy: `${BASE_URL}/refund/view`,
  updateRefundPolicy: `${BASE_URL}/refund/update`,
  deleteRefundPolicy: `${BASE_URL}/refund/delete`,

  //Privacy Policy
  getPrivacyPolicy: `${BASE_URL}/privacy/list`,
  addPrivacyPolicy: `${BASE_URL}/privacy/add`,
  viewPrivacyPolicy: `${BASE_URL}/privacy/view`,
  updatePrivacyPolicy: `${BASE_URL}/privacy/update`,
  deletePrivacyPolicy: `${BASE_URL}/privacy/delete`,
  //Privacy api's end

  //Cancellation Policy
  getCancellationPolicy: `${BASE_URL}/cancellation/list`,
  addCancellationPolicy: `${BASE_URL}/cancellation/add`,
  viewCancellationPolicy: `${BASE_URL}/cancellation/view`,
  updateCancellationPolicy: `${BASE_URL}/cancellation/update`,
  deleteCancellationPolicy: `${BASE_URL}/cancellation/delete`,
  //Cancellation api's end

  //Terms and Policy
  getTermsPolicy: `${BASE_URL}/terms/list`,
  addTermsPolicy: `${BASE_URL}/terms/add`,
  viewTermsPolicy: `${BASE_URL}/terms/view`,
  updateTermsPolicy: `${BASE_URL}/terms/update`,
  deleteTermsPolicy: `${BASE_URL}/terms/delete`,
  //Terms api's end

  //Payment Logs Api
  getPaymentLogs: `${BASE_URL}/paymentLog/list`,
  getIosPaymentLogs: `${BASE_URL}/paymentLog/iosList`,
  //Payment Logs Api End

  //Mood Quotes Api
  getMoodQuotes: `${BASE_URL}/moodQuotes/list`,
  addMoodQuotes: `${BASE_URL}/moodQuotes/add`,
  viewMoodQuotes: `${BASE_URL}/moodQuotes/view`,
  updateMoodQuotes: `${BASE_URL}/moodQuotes/update`,
  deleteMoodQuotes: `${BASE_URL}/moodQuotes/delete`,
  //Mood Quotes Api End

  //Baby Animation Api
  getBabyAnimation: `${BASE_URL}/babyAnimation/list`,
  addBabyAnimation: `${BASE_URL}/babyAnimation/add`,
  viewBabyAnimation: `${BASE_URL}/babyAnimation/view`,
  updateBabyAnimation: `${BASE_URL}/babyAnimation/update`,
  deleteBabyAnimation: `${BASE_URL}/babyAnimation/delete`,
  //Baby Animation Api End

  //Baby Names Api
  getBabyNames: `${BASE_URL}/babyName/list`,
  addBabyNames: `${BASE_URL}/babyName/add`,
  viewBabyNames: `${BASE_URL}/babyName/view`,
  updateBabyNames: `${BASE_URL}/babyName/update`,
  deleteBabyNames: `${BASE_URL}/babyName/delete`,
  getFavoriteBabyNamesList:`${BASE_URL}/babyName/favoritesNamelist`,
  viewFavouriteBabyNames: `${BASE_URL}/babyName/getFavorites`,
  //Baby Names Api End

};
export default apiRoutes;

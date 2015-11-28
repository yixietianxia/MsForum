package net.jforum.view.forum;

import java.text.SimpleDateFormat;
import java.util.GregorianCalendar;
import java.util.List;

import net.jforum.Command;
import net.jforum.SessionFacade;
import net.jforum.entities.MostUsersEverOnline;
import net.jforum.entities.UserSession;
import net.jforum.repository.ForumRepository;
import net.jforum.util.I18n;
import net.jforum.util.preferences.ConfigKeys;
import net.jforum.util.preferences.SystemGlobals;
import net.jforum.util.preferences.TemplateKeys;
import net.jforum.view.forum.common.ForumCommon;

public class FrameAction extends Command {

	public void list() {
		frame();
	}
	public void frame() {
		this.context.put("leftShow", SystemGlobals.getValue(ConfigKeys.HOME_LEFT_MENU_SHOW));
		this.setTemplateName(TemplateKeys.FRAME_FRAME);
	}
	public void leftMenu() {
		this.setTemplateName(TemplateKeys.FRAME_LEFT_MENU);

		this.context.put("allCategories", ForumCommon.getAllCategoriesAndForums(true));
		this.context.put("topicsPerPage", new Integer(SystemGlobals.getIntValue(ConfigKeys.TOPICS_PER_PAGE)));
		this.context.put("rssEnabled", SystemGlobals.getBoolValue(ConfigKeys.RSS_ENABLED));

		this.context.put("totalMessages", new Integer(ForumRepository.getTotalMessages()));
		this.context.put("totalRegisteredUsers", ForumRepository .totalUsers());
		this.context.put("lastUser", ForumRepository.lastRegisteredUser());

		SimpleDateFormat df = new SimpleDateFormat(SystemGlobals.getValue(ConfigKeys.DATE_TIME_FORMAT));
		GregorianCalendar gc = new GregorianCalendar();
		this.context.put("now", df.format(gc.getTime()));

		this.context.put("lastVisit", df.format(SessionFacade.getUserSession().getLastVisit()));
		this.context.put("forumRepository", new ForumRepository());

		// Online Users
		this.context.put("totalOnlineUsers", new Integer(SessionFacade.size()));
		int aid = SystemGlobals.getIntValue(ConfigKeys.ANONYMOUS_USER_ID);

		List onlineUsersList = SessionFacade.getLoggedSessions();

		// Check for an optional language parameter
		UserSession currentUser = SessionFacade.getUserSession();

		if (currentUser.getUserId() == aid) {
			String lang = this.request.getParameter("lang");

			if (lang != null && I18n.languageExists(lang)) {
				currentUser.setLang(lang);
			}
		}

		// If there are only guest users, then just register
		// a single one. In any other situation, we do not
		// show the "guest" username
		if (onlineUsersList.size() == 0) {
			UserSession us = new UserSession();

			us.setUserId(aid);
			us.setUsername(I18n.getMessage("Guest"));

			onlineUsersList.add(us);
		}

		int registeredSize = SessionFacade.registeredSize();
		int anonymousSize = SessionFacade.anonymousSize();
		int totalOnlineUsers = registeredSize + anonymousSize;

		this.context.put("userSessions", onlineUsersList);
		this.context.put("totalOnlineUsers", new Integer(totalOnlineUsers));
		this.context.put("totalRegisteredOnlineUsers", new Integer(registeredSize));
		this.context.put("totalAnonymousUsers", new Integer(anonymousSize));

		// Most users ever online
		MostUsersEverOnline mostUsersEverOnline = ForumRepository.getMostUsersEverOnline();

		if (totalOnlineUsers > mostUsersEverOnline.getTotal()) {
			mostUsersEverOnline.setTotal(totalOnlineUsers);
			mostUsersEverOnline.setTimeInMillis(System.currentTimeMillis());

			ForumRepository.updateMostUsersEverOnline(mostUsersEverOnline);
		}

		this.context.put("mostUsersEverOnline", mostUsersEverOnline);
	}

}

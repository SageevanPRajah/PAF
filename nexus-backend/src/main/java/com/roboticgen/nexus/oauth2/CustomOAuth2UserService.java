package com.roboticgen.nexus.oauth2;

import com.roboticgen.nexus.exception.UserNotFoundException;
import com.roboticgen.nexus.model.User;
import com.roboticgen.nexus.service.UserService;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collections;

public class CustomOAuth2UserService
    implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserService userService;

    public CustomOAuth2UserService(UserService userService) {
        this.userService = userService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest request)
        throws OAuth2AuthenticationException {

        OAuth2User oauthUser = new DefaultOAuth2UserService().loadUser(request);

        String email = oauthUser.getAttribute("email");
        String name  = oauthUser.getAttribute("name");

        User user;
        try {
            user = userService.findByEmail(email);
        } catch (UserNotFoundException ex) {
            // now calls the 2-arg method
            user = userService.registerOAuth2User(email, name);
        }

        var authorities = Collections.singleton(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        return new DefaultOAuth2User(
            authorities,
            oauthUser.getAttributes(),
            "sub"
        );
    }
}

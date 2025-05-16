package com.roboticgen.nexus.oauth2;

import com.roboticgen.nexus.config.JwtService;
import com.roboticgen.nexus.model.User;
import com.roboticgen.nexus.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

public class OAuth2AuthenticationSuccessHandler
    implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserService userService;

    public OAuth2AuthenticationSuccessHandler(
        JwtService jwtService,
        UserService userService
    ) {
        this.jwtService  = jwtService;
        this.userService = userService;
    }

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication auth
    ) throws IOException {
        var oauthUser = (org.springframework.security.oauth2.core.user.OAuth2User)
                            auth.getPrincipal();
        String email = oauthUser.getAttribute("email");

        // if we reach here, user _must_ exist (was created in CustomOAuth2UserService)
        User user = userService.findByEmail(email);

        String accessToken  = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        String redirectUrl = UriComponentsBuilder
            .fromUriString("http://localhost:3000/feed")
            .queryParam("access_token",  accessToken)
            .queryParam("refresh_token", refreshToken)
            .build()
            .toUriString();

        response.sendRedirect(redirectUrl);
    }
}
